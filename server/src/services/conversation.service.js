import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

export async function getOrCreateConversation({ conversationId, title, disease, location }) {
  if (conversationId) {
    const existingConversation = await Conversation.findById(conversationId);

    if (existingConversation) {
      return existingConversation;
    }
  }

  return Conversation.create({
    title: title || "New research conversation",
    activeDiseaseContext: disease || "",
    activeLocationContext: location || "",
  });
}

export async function updateConversationContext(conversation, { disease, location, title }) {
  conversation.activeDiseaseContext = disease || conversation.activeDiseaseContext;
  conversation.activeLocationContext = location || conversation.activeLocationContext;
  conversation.title = title || conversation.title;
  await conversation.save();
  return conversation;
}

export async function addConversationMessage({ conversationId, role, content, metadata = {} }) {
  return Message.create({
    conversationId,
    role,
    content,
    metadata,
  });
}

export async function listConversations() {
  return Conversation.find().sort({ updatedAt: -1 }).limit(20).lean();
}

export async function getConversationMessages(conversationId) {
  return Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
}

export async function getConversationDetail(conversationId) {
  const [conversation, messages, latestAssistantMessage] = await Promise.all([
    Conversation.findById(conversationId).lean(),
    Message.find({ conversationId }).sort({ createdAt: 1 }).lean(),
    Message.findOne({ conversationId, role: "assistant" }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    conversation,
    messages,
    latestAssistantMetadata: latestAssistantMessage?.metadata || null,
  };
}
