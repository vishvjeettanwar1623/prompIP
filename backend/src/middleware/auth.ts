import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  walletAddress?: string;
  body: any;
  params: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const walletAddress = req.headers["x-wallet-address"] as string;

    if (!walletAddress) {
      return res.status(401).json({ error: "No wallet address provided" });
    }

    // Find or create user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${walletAddress}@wallet.local`, // Placeholder email
          passwordHash: "", // No password needed
          walletAddress,
        },
      });
    }

    req.userId = user.id;
    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Invalid wallet address" });
  }
};

// Optional auth middleware - doesn't require authentication but sets userId if present
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const walletAddress = req.headers["x-wallet-address"] as string;

    if (!walletAddress) {
      // No wallet address, continue without authentication
      return next();
    }

    // Find or create user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `${walletAddress}@wallet.local`, // Placeholder email
          passwordHash: "", // No password needed
          walletAddress,
        },
      });
    }

    req.userId = user.id;
    req.walletAddress = walletAddress;
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    // Don't fail if optional auth has issues, just continue
    next();
  }
};
