import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, getMe, logout } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again in a minute.",
      details: [],
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
