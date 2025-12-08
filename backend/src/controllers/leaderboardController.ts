import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get top creators by reputation points
export const getTopCreators = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topCreators = await prisma.user.findMany({
      orderBy: {
        reputationPoints: 'desc'
      },
      take: limit,
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        reputationPoints: true,
        _count: {
          select: {
            prompts: true,
            verifications: true
          }
        }
      }
    });

    res.json(topCreators);
  } catch (error) {
    console.error('Error fetching top creators:', error);
    res.status(500).json({ error: 'Failed to fetch top creators' });
  }
};

// Get most useful prompts by trust score
export const getMostUsefulPrompts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const minVerifications = parseInt(req.query.minVerifications as string) || 3;

    const mostUsefulPrompts = await prisma.prompt.findMany({
      where: {
        verificationCount: {
          gte: minVerifications
        },
        isListed: true
      },
      orderBy: {
        trustScore: 'desc'
      },
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            walletAddress: true,
            nickname: true,
            reputationPoints: true
          }
        }
      }
    });

    res.json(mostUsefulPrompts);
  } catch (error) {
    console.error('Error fetching most useful prompts:', error);
    res.status(500).json({ error: 'Failed to fetch most useful prompts' });
  }
};

// Get most verified prompts by verification count
export const getMostVerifiedPrompts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const mostVerifiedPrompts = await prisma.prompt.findMany({
      where: {
        isListed: true
      },
      orderBy: {
        verificationCount: 'desc'
      },
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            walletAddress: true,
            nickname: true,
            reputationPoints: true
          }
        }
      }
    });

    res.json(mostVerifiedPrompts);
  } catch (error) {
    console.error('Error fetching most verified prompts:', error);
    res.status(500).json({ error: 'Failed to fetch most verified prompts' });
  }
};
