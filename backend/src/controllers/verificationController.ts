import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { issuePromptLicense } from '../story/storyService';
import { Address } from 'viem';

const prisma = new PrismaClient();

// Verify a prompt as useful or not useful
export const verifyPrompt = async (req: Request, res: Response) => {
  try {
    const { id: promptId } = req.params;
    const { userId, isUseful, feedback } = req.body;

    // Validation
    if (!userId || typeof isUseful !== 'boolean') {
      return res.status(400).json({ error: 'userId and isUseful are required' });
    }

    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      include: { creator: true }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Prevent self-verification
    if (prompt.creatorId === userId) {
      return res.status(403).json({ error: 'Cannot verify your own prompt' });
    }

    // Check if user already verified this prompt
    const existingVerification = await prisma.verification.findUnique({
      where: {
        userId_promptId: {
          userId,
          promptId
        }
      }
    });

    if (existingVerification) {
      return res.status(409).json({ error: 'You have already verified this prompt' });
    }

    // Get user's wallet address for minting license
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create verification
    const verification = await prisma.verification.create({
      data: {
        userId,
        promptId,
        isUseful,
        feedback: feedback || null
      }
    });

    // Recalculate prompt scores
    await recalculatePromptScores(promptId);

    // Award reputation points to creator if verification is positive
    if (isUseful) {
      await prisma.user.update({
        where: { id: prompt.creatorId },
        data: {
          reputationPoints: {
            increment: 10
          }
        }
      });
    }

    // Mint verification license if prompt is on-chain
    let licenseData = null;
    if (prompt.storyIpId && prompt.storyLicenseTermsId) {
      try {
        console.log(`🎫 Minting verification license for user ${user.walletAddress}`);
        
        const licenseResult = await issuePromptLicense(
          prompt.storyIpId as Address,
          BigInt(prompt.storyLicenseTermsId),
          user.walletAddress as Address,
          0n, // Free minting - reputation system
          1   // Mint 1 license token
        );

        // Save license to database
        const license = await prisma.license.create({
          data: {
            promptId,
            buyerId: userId,
            storyLicenseId: licenseResult.licenseTokenIds?.[0]?.toString() || 'pending',
            txHash: licenseResult.txHash || ''
          }
        });

        licenseData = {
          txHash: licenseResult.txHash || '',
          licenseTokenId: licenseResult.licenseTokenIds?.[0]?.toString()
        };

        console.log(`✅ Verification license minted! TX: ${licenseResult.txHash}`);
      } catch (licenseError) {
        // Log but don't fail the verification if license minting fails
        console.error('Failed to mint verification license:', licenseError);
      }
    }

    res.status(201).json({
      message: 'Verification submitted successfully',
      verification,
      license: licenseData
    });
  } catch (error) {
    console.error('Error verifying prompt:', error);
    res.status(500).json({ error: 'Failed to verify prompt' });
  }
};

// Get all verifications for a prompt
export const getPromptVerifications = async (req: Request, res: Response) => {
  try {
    const { id: promptId } = req.params;

    const verifications = await prisma.verification.findMany({
      where: { promptId },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            nickname: true,
            reputationPoints: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate summary stats
    const usefulCount = verifications.filter(v => v.isUseful).length;
    const notUsefulCount = verifications.filter(v => !v.isUseful).length;
    const totalCount = verifications.length;
    const trustScore = totalCount > 0 ? (usefulCount / totalCount) * 100 : 0;

    res.json({
      verifications,
      summary: {
        usefulCount,
        notUsefulCount,
        totalCount,
        trustScore: parseFloat(trustScore.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
};

// Helper function to recalculate prompt scores
async function recalculatePromptScores(promptId: string) {
  const verifications = await prisma.verification.findMany({
    where: { promptId },
    include: {
      user: {
        select: { reputationPoints: true }
      }
    }
  });

  const totalCount = verifications.length;
  
  if (totalCount === 0) {
    await prisma.prompt.update({
      where: { id: promptId },
      data: {
        trustScore: 0,
        effectivenessScore: 0,
        verificationCount: 0
      }
    });
    return;
  }

  // Calculate trust score (simple ratio)
  const usefulCount = verifications.filter(v => v.isUseful).length;
  const trustScore = (usefulCount / totalCount) * 100;

  // Calculate effectiveness score (weighted by verifier reputation)
  let weightedSum = 0;
  let totalWeight = 0;

  verifications.forEach(v => {
    const weight = v.user.reputationPoints + 1; // +1 to avoid zero weight
    const value = v.isUseful ? 1 : 0;
    weightedSum += value * weight;
    totalWeight += weight;
  });

  const effectivenessScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  // Update prompt scores
  await prisma.prompt.update({
    where: { id: promptId },
    data: {
      trustScore: parseFloat(trustScore.toFixed(2)),
      effectivenessScore: parseFloat(effectivenessScore.toFixed(2)),
      verificationCount: totalCount
    }
  });
}
