import { Router } from "express";
import {
  createPrompt,
  getMarketplacePrompts,
  getPromptById,
  registerPromptOnChain,
  getUserPrompts,
  getUserLicenses,
  deletePrompt,
  getPromptReputation,
} from "../controllers/promptController";
import { 
  verifyPrompt, 
  getPromptVerifications 
} from "../controllers/verificationController";
import {
  getTopCreators,
  getMostUsefulPrompts,
  getMostVerifiedPrompts
} from "../controllers/leaderboardController";
import {
  setNickname,
  checkNicknameAvailability
} from "../controllers/nicknameController";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";

const router = Router();

// Public routes (with optional auth to check ownership)
router.get("/marketplace", getMarketplacePrompts);
router.get("/:id", optionalAuthMiddleware, getPromptById);
router.get("/:id/reputation", getPromptReputation);

// Protected routes
router.post("/", authMiddleware, createPrompt);
router.post("/:id/register", authMiddleware, registerPromptOnChain);
router.get("/user/prompts", authMiddleware, getUserPrompts);
router.get("/user/licenses", authMiddleware, getUserLicenses);
router.delete("/:id", authMiddleware, deletePrompt);

// Verification routes
router.post("/:id/verify", authMiddleware, verifyPrompt);
router.get("/:id/verifications", getPromptVerifications);

// Leaderboard routes
router.get("/leaderboards/creators", getTopCreators);
router.get("/leaderboards/useful", getMostUsefulPrompts);
router.get("/leaderboards/verified", getMostVerifiedPrompts);

// Nickname routes
router.post("/user/nickname", authMiddleware, setNickname);
router.get("/nickname/:nickname/available", checkNicknameAvailability);

export default router;
