import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20000,
});

export async function searchResearch(payload) {
  const { data } = await apiClient.post("/search", payload);
  return data;
}

export async function fetchConversations() {
  const { data } = await apiClient.get("/conversations");
  return data.conversations || [];
}

export async function fetchConversationMessages(conversationId) {
  const { data } = await apiClient.get(`/conversations/${conversationId}/messages`);
  return data;
}
