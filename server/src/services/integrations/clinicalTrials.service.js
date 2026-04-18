import httpClient from "./httpClient.js";
import { normalizeClinicalTrial } from "../../utils/sourceNormalizer.js";

export async function searchClinicalTrials(query, disease, options = {}) {
  const condition = disease || query;

  if (!condition) {
    return [];
  }

  const response = await httpClient.get("https://clinicaltrials.gov/api/v2/studies", {
    params: {
      "query.cond": condition,
      "query.term": query || undefined,
      pageSize: options.pageSize || 30,
      format: "json",
    },
  });

  return (response.data?.studies || []).map(normalizeClinicalTrial);
}
