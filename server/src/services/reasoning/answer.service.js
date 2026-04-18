import httpClient from "../integrations/httpClient.js";
import { buildResearchAnswerPrompt } from "../../prompts/researchAnswer.prompt.js";

function buildFallbackAnswer({ query, disease, intent, publications, trials }) {
  const topPublications = publications.slice(0, 3);
  const topTrials = trials.slice(0, 2);

  return {
    conditionOverview: disease
      ? `${disease} is the active research context for this search. The ranked evidence combines publications and clinical trials aligned to the user's request. Evidence strength depends on the retrieved source set and should be reviewed directly.`
      : `This search focuses on "${query}" and summarizes the strongest retrieved medical research evidence from publications and clinical trials.`,
    personalizedContext: intent
      ? `The evidence was prioritized around the user's intent: ${intent}. This keeps the answer centered on the treatment or research focus most relevant to the request.`
      : "The answer is based on the current query and the strongest retrieved evidence available in this run.",
    researchInsights: [
      topPublications[0]
        ? `"${topPublications[0].title}" is the highest-ranked publication and strongly matches the disease and intent context for this search.`
        : "No strong publication evidence was available for this query.",
      topPublications[1]
        ? `"${topPublications[1].title}" adds additional publication support and broadens the evidence base beyond the top paper.`
        : "Publication coverage is limited, so conclusions should be treated cautiously.",
      topPublications[2]
        ? `"${topPublications[2].title}" offers further support and helps strengthen depth across the retrieved publication set.`
        : "The publication set is narrower than ideal and would benefit from deeper retrieval expansion.",
    ].filter(Boolean),
    clinicalTrials: topTrials.length
      ? topTrials.map(
          (item) =>
            `"${item.title}" is a relevant clinical-trial match${item.metadata?.status ? ` with status ${item.metadata.status}` : ""} and should be reviewed for eligibility, recruiting context, and location fit.`
        )
      : ["No strong clinical trial match was identified in the ranked set for this query."],
    limitations:
      "This answer was produced from retrieved evidence only. It does not replace clinical advice, may miss relevant studies outside the current retrieval window, and should be validated by reviewing the cited sources directly.",
    generationMode: "fallback",
  };
}

function parseJsonResponse(content) {
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("No JSON object found in model response.");
  }

  return JSON.parse(jsonMatch[0]);
}

async function generateWithOllama({ model, prompt, baseUrl }) {
  const response = await httpClient.post(`${baseUrl}/api/generate`, {
    model,
    prompt,
    stream: false,
    format: "json",
  });

  return parseJsonResponse(response.data?.response || "");
}

export async function generateStructuredAnswer({
  query,
  disease,
  intent,
  publications,
  trials,
  ollamaBaseUrl,
  ollamaModel,
}) {
  const prompt = buildResearchAnswerPrompt({
    query,
    disease,
    intent,
    publications,
    trials,
  });

  try {
    const answer = await generateWithOllama({
      model: ollamaModel,
      prompt,
      baseUrl: ollamaBaseUrl,
    });

    return {
      ...answer,
      generationMode: "ollama",
    };
  } catch (error) {
    return {
      ...buildFallbackAnswer({ query, disease, intent, publications, trials }),
      generationError: error.message,
    };
  }
}
