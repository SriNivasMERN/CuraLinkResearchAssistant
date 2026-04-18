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

function buildSupportingSnippet(item) {
  const snippet = item.metadata?.supportingSnippet || item.summary || "";
  return snippet.slice(0, 240).trim() || "No supporting snippet available.";
}

function buildSourceAttribution({ publications, trials }) {
  return [...publications, ...trials].slice(0, 8).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    authors: item.authors || [],
    year: item.year,
    platform: item.platform,
    url: item.url,
    snippet: buildSupportingSnippet(item),
    metadata: item.type === "trial"
      ? {
          status: item.metadata?.status || "",
          location: item.metadata?.location || "",
          contact: item.metadata?.contact || "",
          eligibilityCriteria: item.metadata?.eligibilityCriteria || "",
          matchedSignals: item.matchedSignals || [],
        }
      : {
          citedByCount: item.metadata?.citedByCount || 0,
          matchedSignals: item.matchedSignals || [],
        },
  }));
}

function buildRetrievalSummary({
  retrievedPublications,
  retrievedTrials,
  rankedPublications,
  rankedTrials,
  shownPublications,
  shownTrials,
  warnings,
}) {
  return {
    retrieved: {
      publications: retrievedPublications,
      trials: retrievedTrials,
      total: retrievedPublications + retrievedTrials,
    },
    ranked: {
      publications: rankedPublications,
      trials: rankedTrials,
      total: rankedPublications + rankedTrials,
    },
    shown: {
      publications: shownPublications,
      trials: shownTrials,
      total: shownPublications + shownTrials,
    },
    sourceMix: [
      retrievedPublications ? "OpenAlex + PubMed" : null,
      retrievedTrials ? "ClinicalTrials.gov" : null,
    ].filter(Boolean),
    warningCount: warnings.length,
  };
}

function buildNoEvidenceAnswer({ query, disease, intent, warnings }) {
  return {
    conditionOverview: disease
      ? `No strong medical evidence was found yet for ${disease}.`
      : `No strong medical evidence was found yet for "${query}".`,
    personalizedContext: intent
      ? `The search focused on: ${intent}. Try a simpler wording or a more specific treatment or condition name.`
      : "Try a simpler question or add the disease or treatment name for better results.",
    researchInsights: [
      "No clear study match was found in this search run.",
      "Try using the disease name together with the treatment, supplement, or symptom you want to check.",
    ],
    clinicalTrials: ["No strong trial match was found in this search run."],
    limitations: warnings.length
      ? "Some data sources were slow or returned warnings, so this search may be incomplete."
      : "This result may be incomplete if the question is too broad, too narrow, or uses uncommon wording.",
    generationMode: "fallback",
  };
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

  const publicationQueries = dedupeQueries(expansion.expandedQueries).slice(0, env.publicationQueryCount);
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
        getOrSetCacheValue(
          `openalex:${expandedQuery}:${env.openAlexPerPage}`,
          () => searchOpenAlex(expandedQuery, { perPage: env.openAlexPerPage })
        ),
        getOrSetCacheValue(
          `pubmed:${expandedQuery}:${env.pubmedRetmax}`,
          () => searchPubMed(expandedQuery, { retmax: env.pubmedRetmax })
        ),
      ]);
      sourceRequests.push(
        getOrSetCacheValue(
          `clinicaltrials:${trialQuery}:${effectiveCondition}:${env.trialsPageSize}`,
          () => searchClinicalTrials(trialQuery, effectiveCondition, { pageSize: env.trialsPageSize }),
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

      const answer =
        ranking.topPublications.length || ranking.topTrials.length
          ? await generateStructuredAnswer({
              query: effectiveQuery,
              disease: effectiveCondition,
              intent: expansion.effectiveIntent,
              publications: ranking.topPublications,
              trials: ranking.topTrials,
              ollamaBaseUrl: env.ollamaBaseUrl,
              ollamaModel: env.ollamaModel,
            })
          : buildNoEvidenceAnswer({
              query: effectiveQuery,
              disease: effectiveCondition,
              intent: expansion.effectiveIntent,
              warnings: uniqueWarnings,
            });
      const sourceAttribution = buildSourceAttribution({
        publications: ranking.topPublications,
        trials: ranking.topTrials,
      });

      const retrievalSummary = buildRetrievalSummary({
        retrievedPublications: publications.length,
        retrievedTrials: trials.length,
        rankedPublications: ranking.rankedPublications.length,
        rankedTrials: ranking.rankedTrials.length,
        shownPublications: ranking.topPublications.length,
        shownTrials: ranking.topTrials.length,
        warnings: uniqueWarnings,
      });

      return {
        ranking,
        answer,
        sourceAttribution,
        retrievalSummary,
        warnings: uniqueWarnings,
      };
    },
    1000 * 60 * 3
  );

  const { ranking, answer, sourceAttribution, retrievalSummary, warnings } = computedResult;

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
          sourceAttribution,
          retrievalSummary,
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
    sourceAttribution,
    retrievalSummary,
    publicationCandidates: ranking.rankedPublications,
    trialCandidates: ranking.rankedTrials,
    counts: {
      publications: ranking.rankedPublications.length,
      trials: ranking.rankedTrials.length,
    },
    warnings,
  };
}
