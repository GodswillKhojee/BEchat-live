import { Router } from "express";
import {
  listConversations,
  createConversation,
  getConversation,
} from "../controllers/convController.js";
import {
  getMessages,
  sendMessage,
  searchMessages,
  markAsRead,
} from "../controllers/messageController.js";
import { authenticate, requireConversationMember } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

// Conversations collection
router.get("/", listConversations);
router.post("/", createConversation);

// Single conversation & nested messages
router.get("/:id", requireConversationMember, getConversation);
router.get("/:id/messages", requireConversationMember, getMessages);
router.post("/:id/messages", requireConversationMember, sendMessage);
router.get("/:id/messages/search", requireConversationMember, searchMessages);
router.post("/:id/read", requireConversationMember, markAsRead);

export default router;
