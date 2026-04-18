export function buildResearchAnswerPrompt({ query, disease, intent, publications, trials }) {
  const serializedPublications = publications
    .slice(0, 6)
    .map(
      (item, index) =>
        `${index + 1}. ${item.title} | ${item.platform} | ${item.year || "Year unavailable"} | Score ${
          item.relevanceScore
        }\nAuthors: ${item.authors?.join(", ") || "Unknown"}\nSummary: ${item.summary || "No summary available."}`
    )
    .join("\n\n");

  const serializedTrials = trials
    .slice(0, 4)
    .map(
      (item, index) =>
        `${index + 1}. ${item.title} | ${item.metadata?.status || "Status unavailable"} | Score ${
          item.relevanceScore
        }\nSummary: ${item.summary || "No trial summary available."}\nLocation: ${
          item.metadata?.location || "Location unavailable"
        }\nEligibility: ${item.metadata?.eligibilityCriteria || "Eligibility unavailable"}`
    )
    .join("\n\n");

  return `
You are generating a grounded medical research summary.
Use only the evidence provided below.
Do not invent facts, treatments, or trial details.
If evidence is limited, explicitly say that evidence is limited.
Write compact, evidence-led outputs.

User query: ${query}
Disease context: ${disease || "Not clearly specified"}
Intent context: ${intent || "General medical research exploration"}

Return JSON with these string fields:
- conditionOverview
- personalizedContext
- limitations

And these array fields:
- researchInsights: array of 2 to 4 strings
- clinicalTrials: array of 0 to 3 strings

Evidence pack - Publications:
${serializedPublications || "No publication evidence available."}

Evidence pack - Clinical Trials:
${serializedTrials || "No clinical trial evidence available."}
  `.trim();
}
