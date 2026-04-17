import httpClient from "./httpClient.js";
import { normalizeOpenAlexWork } from "../../utils/sourceNormalizer.js";

export async function searchOpenAlex(query) {
  if (!query) {
    return [];
  }

  const response = await httpClient.get("https://api.openalex.org/works", {
    params: {
      search: query,
      "per-page": 10,
      sort: "relevance_score:desc",
    },
  });

  return (response.data?.results || []).map(normalizeOpenAlexWork);
}

