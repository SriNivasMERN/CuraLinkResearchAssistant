import httpClient from "./httpClient.js";
import { normalizeClinicalTrial } from "../../utils/sourceNormalizer.js";

export async function searchClinicalTrials(query, disease) {
  const condition = disease || query;

  if (!condition) {
    return [];
  }

  const response = await httpClient.get("https://clinicaltrials.gov/api/v2/studies", {
    params: {
      "query.cond": condition,
      pageSize: 10,
      format: "json",
    },
  });

  return (response.data?.studies || []).map(normalizeClinicalTrial);
}

