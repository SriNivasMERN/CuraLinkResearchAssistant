import { runSearch } from "../services/search.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchResearch = asyncHandler(async (req, res) => {
  const { query = "", structuredInput = {}, conversationId = "" } = req.body || {};

  if (!query.trim() && !structuredInput.disease && !structuredInput.intentQuery) {
    const error = new Error("Please enter a health question, or add a condition and what you want to know.");
    error.statusCode = 400;
    throw error;
  }

  const result = await runSearch({ query, structuredInput, conversationId });
  res.json(result);
});
