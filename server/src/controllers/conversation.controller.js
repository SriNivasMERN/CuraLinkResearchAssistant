import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getConversationDetail as loadConversationDetail,
  listConversations,
} from "../services/conversation.service.js";

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await listConversations();
  res.json({ conversations });
});

export const getConversationDetail = asyncHandler(async (req, res) => {
  const detail = await loadConversationDetail(req.params.conversationId);
  res.json(detail);
});
