import { Router } from "express";
import { editMessage, deleteMessage, toggleReaction } from "../controllers/messageController.js";
import { authenticate, requireMessageAuthor } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.patch("/:id", requireMessageAuthor, editMessage);
router.delete("/:id", requireMessageAuthor, deleteMessage);
router.post("/:id/reactions", toggleReaction);

export default router;
