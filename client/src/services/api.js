import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 60000,
});

export async function searchResearch(payload) {
  try {
    const { data } = await apiClient.post("/search", payload);
    return data;
  } catch (error) {
    if (error.code === "ECONNABORTED" || /timeout/i.test(error.message || "")) {
      throw new Error(
        "This search is taking a little longer than usual. Please try again in a moment."
      );
    }

    throw new Error(
      error.response?.data?.message || error.message || "We could not finish that search right now."
    );
  }
}

export async function fetchConversations() {
  const { data } = await apiClient.get("/conversations");
  return data.conversations || [];
}

export async function fetchConversationMessages(conversationId) {
  const { data } = await apiClient.get(`/conversations/${conversationId}/messages`);
  return data;
}
