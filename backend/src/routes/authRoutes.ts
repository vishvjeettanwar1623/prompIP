import { Router } from "express";
import { signup, login, setUsername, getUserInfo } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/set-username", authMiddleware, setUsername);
router.get("/user-info", authMiddleware, getUserInfo);

export default router;
