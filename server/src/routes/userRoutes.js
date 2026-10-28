import { Router } from "express";
import { getUsers, updateProfile, updateStatus } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getUsers);
router.patch("/profile", updateProfile);
router.patch("/status", updateStatus);

export default router;
