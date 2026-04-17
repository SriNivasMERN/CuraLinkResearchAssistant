import { Router } from "express";
import {
  getConversationDetail,
  getConversations,
} from "../controllers/conversation.controller.js";

const router = Router();

router.get("/", getConversations);
router.get("/:conversationId/messages", getConversationDetail);

export default router;
