import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, walletAddress } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        walletAddress: walletAddress || null,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
};

export const setUsername = async (req: AuthRequest, res: Response) => {
  try {
    const { nickname } = req.body;
    const userId = req.userId;

    if (!nickname || typeof nickname !== 'string') {
      return res.status(400).json({ error: "Valid nickname is required" });
    }

    // Validate username format (3-20 chars, alphanumeric only)
    if (!/^[a-zA-Z0-9]{3,20}$/.test(nickname)) {
      return res.status(400).json({ 
        error: "Username must be 3-20 characters and contain only letters and numbers" 
      });
    }

    // Get current user to check if they already have a username
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent changing username once it's set
    if (currentUser.nickname) {
      return res.status(400).json({ 
        error: "Username is already set and cannot be changed" 
      });
    }

    // Check if nickname is already taken
    const existingUser = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Update user's nickname (only if not set before)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { nickname },
    });

    res.json({
      message: "Username set successfully",
      nickname: updatedUser.nickname,
    });
  } catch (error) {
    console.error("Set username error:", error);
    res.status(500).json({ error: "Failed to set username" });
  }
};

export const getUserInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        nickname: true,
        reputationPoints: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
};
