import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";
import {
  registerPromptAsIP,
  registerDerivativePrompt,
  createPromptLicenseDefinition,
  issuePromptLicense,
} from "../story/storyService";
import { Address } from "viem";

const prisma = new PrismaClient();

// Create a new prompt (draft) - can be original or remix
export const createPrompt = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, promptText, category, licenseType, parentPromptId } =
      req.body;
    const userId = req.userId!;

    if (!title || !description || !promptText || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // If this is a remix, verify parent exists
    if (parentPromptId) {
      const parentPrompt = await prisma.prompt.findUnique({
        where: { id: parentPromptId }
      });
      if (!parentPrompt) {
        return res.status(404).json({ error: "Parent prompt not found" });
      }
    }

    const prompt = await prisma.prompt.create({
      data: {
        title,
        description,
        promptText,
        category,
        licenseType: licenseType || "ONE_TIME",
        creatorId: userId,
        parentPromptId: parentPromptId || null,
        isListed: true,
      },
    });

    res.status(201).json(prompt);
  } catch (error) {
    console.error("Create prompt error:", error);
    res.status(500).json({ error: "Failed to create prompt" });
  }
};

// Get marketplace prompts (without promptText)
export const getMarketplacePrompts = async (req: AuthRequest, res: Response) => {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { isListed: true },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        licenseType: true,
        storyIpId: true,
        parentPromptId: true,
        trustScore: true,
        effectivenessScore: true,
        verificationCount: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            nickname: true,
            reputationPoints: true,
          },
        },
        parentPrompt: {
          select: {
            id: true,
            title: true,
            storyIpId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(prompts);
  } catch (error) {
    console.error("Get marketplace prompts error:", error);
    res.status(500).json({ error: "Failed to fetch prompts" });
  }
};

// Get single prompt with access control
export const getPromptById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            walletAddress: true,
            nickname: true,
            reputationPoints: true,
          },
        },
        licenses: {
          where: userId ? { buyerId: userId } : undefined,
        },
        parentPrompt: {
          select: {
            id: true,
            title: true,
            storyIpId: true,
            creator: {
              select: {
                nickname: true,
                walletAddress: true,
              },
            },
          },
        },
        derivatives: {
          select: {
            id: true,
            title: true,
            storyIpId: true,
            trustScore: true,
          },
          take: 5, // Show first 5 derivatives
        },
        _count: {
          select: {
            verifications: true,
            derivatives: true,
          }
        }
      },
    });

    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    // Check if user has access to full prompt
    const isCreator = userId && prompt.creatorId === userId;
    const hasLicense = userId && prompt.licenses.length > 0;
    const hasAccess = isCreator || hasLicense;

    // Remove promptText if user doesn't have access
    const response: any = { ...prompt };
    if (!hasAccess) {
      delete response.promptText;
      response.locked = true;
    } else {
      response.locked = false;
    }

    // Remove licenses array from response (just for access check)
    delete response.licenses;

    res.json(response);
  } catch (error) {
    console.error("Get prompt error:", error);
    res.status(500).json({ error: "Failed to fetch prompt" });
  }
};

// Register prompt on Story Protocol
export const registerPromptOnChain = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        parentPrompt: true, // Include parent for derivative check
        creator: true, // Include creator for reputation data
      },
    });

    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    if (prompt.creatorId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (prompt.storyIpId) {
      return res.status(400).json({ error: "Prompt already registered on-chain" });
    }

    // Prepare reputation data for on-chain metadata
    const reputationData = {
      trustScore: prompt.trustScore,
      effectivenessScore: prompt.effectivenessScore,
      verificationCount: prompt.verificationCount,
      creatorReputationPoints: prompt.creator.reputationPoints,
    };

    let ipResult;
    const isDerivative = prompt.parentPromptId && prompt.parentPrompt?.storyIpId && prompt.parentPrompt?.storyLicenseTermsId;

    if (isDerivative) {
      // Register as derivative (remix) of parent IP
      console.log(`🔄 Registering as derivative of parent: ${prompt.parentPrompt!.storyIpId}`);
      
      ipResult = await registerDerivativePrompt(
        {
          name: prompt.title,
          description: prompt.description,
          attributes: [
            { trait_type: "category", value: prompt.category },
            { trait_type: "license_type", value: prompt.licenseType },
            { trait_type: "remix_of", value: prompt.parentPrompt!.title },
          ],
        },
        prompt.parentPrompt!.storyIpId as Address,
        BigInt(prompt.parentPrompt!.storyLicenseTermsId!)
      );

      // Update prompt with Story data (derivatives don't need separate license terms)
      const updatedPrompt = await prisma.prompt.update({
        where: { id },
        data: {
          storyIpId: ipResult.ipId,
          storyLicenseTermsId: prompt.parentPrompt!.storyLicenseTermsId, // Inherit parent's license
        },
      });

      res.json({
        prompt: updatedPrompt,
        ipTxHash: ipResult.txHash,
        isDerivative: true,
        parentIpId: prompt.parentPrompt!.storyIpId,
        reputationSnapshot: reputationData,
      });
    } else {
      // Register as original IP with reputation data
      ipResult = await registerPromptAsIP(
        {
          name: prompt.title,
          description: prompt.description,
          attributes: [
            { trait_type: "category", value: prompt.category },
            { trait_type: "license_type", value: prompt.licenseType },
          ],
        },
        reputationData
      );

      // Create license definition
      const licenseResult = await createPromptLicenseDefinition(
        ipResult.ipId as Address,
        {
          commercialUse: true,
          allowResale: prompt.licenseType === "RESALE_ALLOWED",
          royaltyBps: 500, // 5% royalty
        }
      );

      // Update prompt with Story data
      const updatedPrompt = await prisma.prompt.update({
        where: { id },
        data: {
          storyIpId: ipResult.ipId,
          storyLicenseTermsId: licenseResult.licenseTermsId?.toString(),
        },
      });

      res.json({
        prompt: updatedPrompt,
        ipTxHash: ipResult.txHash,
        licenseTxHash: licenseResult.txHash,
        isDerivative: false,
        reputationSnapshot: reputationData,
      });
    }
  } catch (error) {
    console.error("Register prompt error:", error);
    res.status(500).json({ error: "Failed to register prompt on-chain" });
  }
};

// Get user's created prompts
export const getUserPrompts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const prompts = await prisma.prompt.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: { 
            licenses: true,
            verifications: true
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const promptsWithStats = prompts.map(prompt => ({
      ...prompt,
      licensesCount: prompt._count.licenses,
      verificationsCount: prompt._count.verifications,
    }));

    res.json(promptsWithStats);
  } catch (error) {
    console.error("Get user prompts error:", error);
    res.status(500).json({ error: "Failed to fetch user prompts" });
  }
};

// Get user's purchased licenses
export const getUserLicenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const licenses = await prisma.license.findMany({
      where: { buyerId: userId },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            storyIpId: true,
            trustScore: true,
            verificationCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(licenses);
  } catch (error) {
    console.error("Get user licenses error:", error);
    res.status(500).json({ error: "Failed to fetch user licenses" });
  }
};

// Delete prompt (only if not registered on blockchain)
export const deletePrompt = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    if (prompt.creatorId !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this prompt" });
    }

    if (prompt.storyIpId) {
      return res.status(400).json({ 
        error: "Cannot delete prompts registered on blockchain" 
      });
}

    // Delete the prompt
    await prisma.prompt.delete({
      where: { id },
    });

    res.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Delete prompt error:", error);
    res.status(500).json({ error: "Failed to delete prompt" });
  }
};

// Get reputation status for a prompt (both on-chain snapshot and current)
export const getPromptReputation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            reputationPoints: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            verifications: true,
            derivatives: true,
          },
        },
      },
    });

    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    const currentReputation = {
      trustScore: prompt.trustScore,
      effectivenessScore: prompt.effectivenessScore,
      verificationCount: prompt.verificationCount,
      creatorReputationPoints: prompt.creator.reputationPoints,
      derivativeCount: prompt._count.derivatives,
    };

    res.json({
      promptId: prompt.id,
      storyIpId: prompt.storyIpId,
      isOnChain: !!prompt.storyIpId,
      currentReputation,
      // Note: On-chain snapshot was recorded at registration time
      // The metadata hash in Story Protocol contains the snapshot
      explorerUrl: prompt.storyIpId 
        ? `https://testnet.storyscan.xyz/ipa/${prompt.storyIpId}`
        : null,
    });
  } catch (error) {
    console.error("Get prompt reputation error:", error);
    res.status(500).json({ error: "Failed to get prompt reputation" });
  }
};
