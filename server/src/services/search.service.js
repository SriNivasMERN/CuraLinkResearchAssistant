import Conversation from "../models/Conversation.js";
import SearchSession from "../models/SearchSession.js";
import { searchOpenAlex } from "./integrations/openAlex.service.js";
import { searchPubMed } from "./integrations/pubmed.service.js";
import { searchClinicalTrials } from "./integrations/clinicalTrials.service.js";

function buildQuery(query, structuredInput) {
  if (query?.trim()) {
    return query.trim();
  }

  return [structuredInput.disease, structuredInput.intentQuery].filter(Boolean).join(" ").trim();
}

export async function runSearch({ query, structuredInput }) {
  const normalizedStructuredInput = {
    patientName: structuredInput?.patientName || "",
    disease: structuredInput?.disease || "",
    intentQuery: structuredInput?.intentQuery || "",
    location: structuredInput?.location || "",
  };

  const effectiveQuery = buildQuery(query, normalizedStructuredInput);

  const conversation = await Conversation.create({
    title: effectiveQuery || "New research conversation",
    activeDiseaseContext: normalizedStructuredInput.disease,
    activeLocationContext: normalizedStructuredInput.location,
  });

  const [openAlexResults, pubMedResults, clinicalTrialResults] = await Promise.allSettled([
    searchOpenAlex(effectiveQuery),
    searchPubMed(effectiveQuery),
    searchClinicalTrials(effectiveQuery, normalizedStructuredInput.disease),
  ]);

  const publications = [];
  const trials = [];

  if (openAlexResults.status === "fulfilled") {
    publications.push(...openAlexResults.value);
  }

  if (pubMedResults.status === "fulfilled") {
    publications.push(...pubMedResults.value);
  }

  if (clinicalTrialResults.status === "fulfilled") {
    trials.push(...clinicalTrialResults.value);
  }

  await SearchSession.create({
    conversationId: conversation._id,
    originalQuery: effectiveQuery,
    structuredInput: normalizedStructuredInput,
    expandedQueries: [effectiveQuery].filter(Boolean),
    resultCounts: {
      publications: publications.length,
      trials: trials.length,
    },
  });

  return {
    conversationId: conversation._id,
    query: effectiveQuery,
    publications,
    trials,
    counts: {
      publications: publications.length,
      trials: trials.length,
    },
    warnings: [openAlexResults, pubMedResults, clinicalTrialResults]
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason?.message || "A source request failed"),
  };
}

