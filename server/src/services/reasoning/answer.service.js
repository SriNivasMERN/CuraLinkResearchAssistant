import httpClient from "../integrations/httpClient.js";
import { buildResearchAnswerPrompt } from "../../prompts/researchAnswer.prompt.js";

function buildFallbackAnswer({ query, disease, intent, publications, trials }) {
  const topPublicationTitles = publications.slice(0, 3).map((item) => item.title);
  const topTrialTitles = trials.slice(0, 2).map((item) => item.title);

  return {
    conditionOverview: disease
      ? `${disease} is the active research context for this search. The current results combine publication evidence and trial data related to the user's request.`
      : `This search focuses on the query "${query}" and summarizes the strongest retrieved medical research evidence.`,
    personalizedContext: intent
      ? `The answer is prioritized around the user's intent: ${intent}.`
      : "The answer is based on the current query and the strongest retrieved evidence.",
    researchInsights: [
      topPublicationTitles[0]
        ? `The highest-ranked publication is "${topPublicationTitles[0]}", which was selected because it best matched the disease and intent context.`
        : "No strong publication evidence was available for this query.",
      topPublicationTitles[1]
        ? `Additional publication support includes "${topPublicationTitles[1]}", helping provide broader evidence coverage.`
        : "Publication coverage is limited, so conclusions should be treated cautiously.",
      topPublicationTitles[2]
        ? `A further supporting source is "${topPublicationTitles[2]}", which adds depth to the retrieved evidence set.`
        : "The result set should be expanded further in later iterations for deeper research breadth.",
    ].filter(Boolean),
    clinicalTrials: topTrialTitles.length
      ? topTrialTitles.map(
          (title) =>
            `Relevant clinical trial evidence includes "${title}", which may be useful for eligibility and recruiting-status review.`
        )
      : ["No strong clinical trial match was identified in the ranked set for this query."],
    limitations:
      "This answer was produced from retrieved evidence only. It does not replace clinical advice, and some sources may require deeper manual review for full context.",
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

