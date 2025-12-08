import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Set or update user nickname
export const setNickname = async (req: Request, res: Response) => {
  try {
    const { userId, nickname } = req.body;

    if (!userId || !nickname) {
      return res.status(400).json({ error: 'userId and nickname are required' });
    }

    // Validate nickname format
    const nicknameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!nicknameRegex.test(nickname)) {
      return res.status(400).json({ 
        error: 'Nickname must be 3-20 characters and contain only letters, numbers, underscores, and hyphens' 
      });
    }

    // Check if nickname is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { nickname }
    });

    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ error: 'Nickname is already taken' });
    }

    // Update user nickname
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { nickname },
      select: {
        id: true,
        walletAddress: true,
        nickname: true,
        reputationPoints: true
      }
    });

    res.json({
      message: 'Nickname updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error setting nickname:', error);
    res.status(500).json({ error: 'Failed to set nickname' });
  }
};

// Check nickname availability
export const checkNicknameAvailability = async (req: Request, res: Response) => {
  try {
    const { nickname } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { nickname }
    });

    res.json({
      available: !existingUser,
      nickname
    });
  } catch (error) {
    console.error('Error checking nickname availability:', error);
    res.status(500).json({ error: 'Failed to check nickname availability' });
  }
};
