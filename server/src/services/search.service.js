import SearchSession from "../models/SearchSession.js";
import { searchOpenAlex } from "./integrations/openAlex.service.js";
import { searchPubMed } from "./integrations/pubmed.service.js";
import { searchClinicalTrials } from "./integrations/clinicalTrials.service.js";
import { expandResearchQueries } from "./queryExpansion.service.js";
import { rankEvidence } from "./ranking.service.js";
import { env } from "../config/env.js";
import { generateStructuredAnswer } from "./reasoning/answer.service.js";
import { getOrSetCacheValue } from "./cache.service.js";
import {
  addConversationMessage,
  getOrCreateConversation,
  updateConversationContext,
} from "./conversation.service.js";

function buildQuery(query, structuredInput) {
  if (query?.trim()) {
    return query.trim();
  }

  return [structuredInput.disease, structuredInput.intentQuery].filter(Boolean).join(" ").trim();
}

function deriveCondition(query, structuredInput, conversation) {
  if (structuredInput?.disease?.trim()) {
    return structuredInput.disease.trim();
  }

  if (conversation?.activeDiseaseContext?.trim()) {
    return conversation.activeDiseaseContext.trim();
  }

  const normalizedQuery = (query || "").trim();

  if (!normalizedQuery) {
    return "";
  }

  const explicitForMatch = normalizedQuery.match(
    /\b(?:for|in|with|about)\s+([a-z0-9' -]+)$/i
  );

  if (explicitForMatch?.[1]) {
    return explicitForMatch[1].trim();
  }

  const medicalKeywordMatch = normalizedQuery.match(
    /([a-z0-9' -]+(?:cancer|disease|diabetes|syndrome|tumor|tumour|carcinoma|parkinson's|alzheimer's))/i
  );

  if (medicalKeywordMatch?.[1]) {
    return medicalKeywordMatch[1].trim();
  }

  return normalizedQuery;
}

function buildSearchCacheKey({ query, disease, intent, location }) {
  return [
    "search",
    query || "",
    disease || "",
    intent || "",
    location || "",
  ]
    .join(":")
    .toLowerCase();
}

function dedupeQueries(items) {
  return Array.from(new Set(items.filter(Boolean).map((item) => item.trim()))).filter(Boolean);
}

export async function runSearch({ query, structuredInput, conversationId }) {
  const normalizedStructuredInput = {
    patientName: structuredInput?.patientName || "",
    disease: structuredInput?.disease || "",
    intentQuery: structuredInput?.intentQuery || "",
    location: structuredInput?.location || "",
  };

  const initialQuery = buildQuery(query, normalizedStructuredInput);

  const conversation = await getOrCreateConversation({
    conversationId,
    title: initialQuery || "New research conversation",
    disease: normalizedStructuredInput.disease,
    location: normalizedStructuredInput.location,
  });
  const explicitCondition = deriveCondition(initialQuery, normalizedStructuredInput, conversation);

  const expansion = expandResearchQueries({
    query: initialQuery,
    disease: explicitCondition,
    structuredInput: normalizedStructuredInput,
    conversationContext: conversation,
  });

  const effectiveQuery = expansion.expandedQueries[0] || initialQuery;
  const effectiveCondition = expansion.effectiveDisease;

  await updateConversationContext(conversation, {
    disease: effectiveCondition,
    location: expansion.location,
    title: effectiveQuery || conversation.title,
  });

  await addConversationMessage({
    conversationId: conversation._id,
    role: "user",
    content: query?.trim() || effectiveQuery,
    metadata: {
      structuredInput: normalizedStructuredInput,
      expandedQueries: expansion.expandedQueries,
    },
  });

  const publicationQueries = dedupeQueries(expansion.expandedQueries).slice(0, 2);
  const trialQuery = expansion.expandedQueries.find((item) => item.toLowerCase().includes("clinical trials"))
    || effectiveQuery;
  const searchCacheKey = buildSearchCacheKey({
    query: effectiveQuery,
    disease: effectiveCondition,
    intent: expansion.effectiveIntent,
    location: expansion.location,
  });

  const computedResult = await getOrSetCacheValue(
    searchCacheKey,
    async () => {
      const sourceRequests = publicationQueries.flatMap((expandedQuery) => [
        getOrSetCacheValue(`openalex:${expandedQuery}`, () => searchOpenAlex(expandedQuery)),
        getOrSetCacheValue(`pubmed:${expandedQuery}`, () => searchPubMed(expandedQuery)),
      ]);
      sourceRequests.push(
        getOrSetCacheValue(
          `clinicaltrials:${trialQuery}:${effectiveCondition}`,
          () => searchClinicalTrials(trialQuery, effectiveCondition),
          1000 * 60 * 5
        )
      );

      const sourceResults = await Promise.allSettled(sourceRequests);
      const publications = [];
      const trials = [];
      const warnings = [];

      sourceResults.forEach((result, index) => {
        const isTrialRequest = index === sourceResults.length - 1;

        if (result.status === "fulfilled") {
          if (isTrialRequest) {
            trials.push(...result.value);
          } else {
            publications.push(...result.value);
          }
        } else {
          warnings.push(result.reason?.message || "A source request failed");
        }
      });

      const uniqueWarnings = Array.from(new Set(warnings));

      const ranking = rankEvidence({
        publications,
        trials,
        context: {
          query: effectiveQuery,
          disease: effectiveCondition,
          intent: expansion.effectiveIntent,
          location: expansion.location,
        },
      });

      const answer = await generateStructuredAnswer({
        query: effectiveQuery,
        disease: effectiveCondition,
        intent: expansion.effectiveIntent,
        publications: ranking.topPublications,
        trials: ranking.topTrials,
        ollamaBaseUrl: env.ollamaBaseUrl,
        ollamaModel: env.ollamaModel,
      });

      return {
        ranking,
        answer,
        warnings: uniqueWarnings,
      };
    },
    1000 * 60 * 3
  );

  const { ranking, answer, warnings } = computedResult;

  const responseContext = {
    disease: effectiveCondition,
    intent: expansion.effectiveIntent,
    location: expansion.location,
    expandedQueries: expansion.expandedQueries,
  };

  await Promise.all([
    SearchSession.create({
      conversationId: conversation._id,
      originalQuery: effectiveQuery,
      structuredInput: normalizedStructuredInput,
      expandedQueries: expansion.expandedQueries,
      topPublicationIds: ranking.topPublications.map((item) => item.id),
      topTrialIds: ranking.topTrials.map((item) => item.id),
      resultCounts: {
        publications: ranking.rankedPublications.length,
        trials: ranking.rankedTrials.length,
      },
    }),
    addConversationMessage({
      conversationId: conversation._id,
      role: "assistant",
      content: answer.conditionOverview,
      metadata: {
        answer,
        context: responseContext,
        warnings,
        publications: ranking.topPublications,
        trials: ranking.topTrials,
        counts: {
          publications: ranking.rankedPublications.length,
          trials: ranking.rankedTrials.length,
        },
      },
    }),
  ]);

  return {
    conversationId: conversation._id,
    query: effectiveQuery,
    context: responseContext,
    answer,
    publications: ranking.topPublications,
    trials: ranking.topTrials,
    publicationCandidates: ranking.rankedPublications,
    trialCandidates: ranking.rankedTrials,
    counts: {
      publications: ranking.rankedPublications.length,
      trials: ranking.rankedTrials.length,
    },
    warnings,
  };
}
