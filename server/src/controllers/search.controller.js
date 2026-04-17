import { runSearch } from "../services/search.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchResearch = asyncHandler(async (req, res) => {
  const { query = "", structuredInput = {} } = req.body || {};

  if (!query.trim() && !structuredInput.disease && !structuredInput.intentQuery) {
    const error = new Error("Provide a natural query or structured disease/intent input.");
    error.statusCode = 400;
    throw error;
  }

  const result = await runSearch({ query, structuredInput });
  res.json(result);
});

