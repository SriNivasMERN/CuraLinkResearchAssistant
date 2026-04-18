import httpClient from "./httpClient.js";
import { normalizeOpenAlexWork } from "../../utils/sourceNormalizer.js";

export async function searchOpenAlex(query, options = {}) {
  if (!query) {
    return [];
  }

  const response = await httpClient.get("https://api.openalex.org/works", {
    params: {
      search: query,
      "per-page": options.perPage || 40,
      sort: "relevance_score:desc",
      select:
        "id,title,abstract_inverted_index,authorships,publication_year,primary_location,cited_by_count,ids",
    },
  });

  return (response.data?.results || []).map(normalizeOpenAlexWork);
}
