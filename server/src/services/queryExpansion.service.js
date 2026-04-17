const stopWords = new Set([
  "latest",
  "recent",
  "about",
  "with",
  "for",
  "the",
  "and",
  "can",
  "should",
  "take",
  "what",
  "are",
  "is",
  "of",
]);

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractIntentTerms(text) {
  return (text || "")
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .map((token) => token.trim())
    .filter((token) => token && !stopWords.has(token));
}

function deriveIntentLabel(query, structuredInput) {
  if (structuredInput.intentQuery?.trim()) {
    return structuredInput.intentQuery.trim();
  }

  const normalizedQuery = normalizeWhitespace(query || "");

  if (!normalizedQuery) {
    return "";
  }

  const withoutDisease = structuredInput.disease
    ? normalizedQuery.replace(new RegExp(structuredInput.disease, "ig"), "").trim()
    : normalizedQuery;

  return withoutDisease || normalizedQuery;
}

export function expandResearchQueries({ query, disease, structuredInput, conversationContext }) {
  const normalizedQuery = normalizeWhitespace(query || "");
  const normalizedDisease =
    disease?.trim() || conversationContext?.activeDiseaseContext?.trim() || "";
  const normalizedIntent = deriveIntentLabel(normalizedQuery, structuredInput);
  const location =
    structuredInput.location?.trim() || conversationContext?.activeLocationContext?.trim() || "";
  const intentTerms = extractIntentTerms(normalizedIntent).slice(0, 5);

  const candidates = new Set();

  if (normalizedQuery) {
    candidates.add(normalizedQuery);
  }

  if (normalizedDisease && normalizedIntent) {
    candidates.add(normalizeWhitespace(`${normalizedIntent} ${normalizedDisease}`));
  }

  if (normalizedDisease) {
    candidates.add(normalizeWhitespace(`${normalizedDisease} latest treatment research`));
    candidates.add(normalizeWhitespace(`${normalizedDisease} clinical trials`));
  }

  if (normalizedDisease && intentTerms.length) {
    candidates.add(normalizeWhitespace(`${intentTerms.join(" ")} ${normalizedDisease}`));
    candidates.add(normalizeWhitespace(`${normalizedDisease} ${intentTerms.join(" ")} study`));
  }

  if (normalizedDisease && location) {
    candidates.add(normalizeWhitespace(`${normalizedDisease} clinical trials ${location}`));
  }

  return {
    effectiveDisease: normalizedDisease,
    effectiveIntent: normalizedIntent,
    location,
    expandedQueries: Array.from(candidates).filter(Boolean).slice(0, 6),
  };
}

