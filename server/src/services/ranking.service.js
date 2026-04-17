function calculateKeywordScore(text, keyword) {
  if (!text || !keyword) {
    return 0;
  }

  return text.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0;
}

function calculateRecencyBoost(year) {
  if (!year) {
    return 0;
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 1) {
    return 1.5;
  }

  if (age <= 3) {
    return 1.2;
  }

  if (age <= 6) {
    return 0.7;
  }

  return 0.25;
}

function calculateMetadataBoost(item) {
  let score = 0;

  if (item.summary) {
    score += 0.8;
  }

  if (item.authors?.length) {
    score += 0.4;
  }

  if (item.url) {
    score += 0.2;
  }

  return score;
}

function scorePublication(item, context) {
  const haystack = [item.title, item.summary, context.query].filter(Boolean).join(" ");
  const diseaseScore = calculateKeywordScore(haystack, context.disease) * 3;
  const intentScore = calculateKeywordScore(haystack, context.intent) * 2.4;
  const recencyBoost = calculateRecencyBoost(item.year);
  const metadataBoost = calculateMetadataBoost(item);
  const sourceBoost = item.platform === "PubMed" ? 1 : 0.8;

  return Number((diseaseScore + intentScore + recencyBoost + metadataBoost + sourceBoost).toFixed(2));
}

function scoreTrial(item, context) {
  const haystack = [item.title, item.summary, item.metadata?.status, context.query]
    .filter(Boolean)
    .join(" ");
  const diseaseScore = calculateKeywordScore(haystack, context.disease) * 3;
  const intentScore = calculateKeywordScore(haystack, context.intent) * 2;
  const recruitingBoost = /recruiting|active|not yet recruiting/i.test(item.metadata?.status || "")
    ? 1.5
    : 0.5;
  const locationBoost =
    context.location && item.metadata?.location?.toLowerCase().includes(context.location.toLowerCase())
      ? 1
      : 0;
  const metadataBoost = calculateMetadataBoost(item);

  return Number((diseaseScore + intentScore + recruitingBoost + locationBoost + metadataBoost).toFixed(2));
}

function dedupePublications(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.title}`.toLowerCase().replace(/\s+/g, " ").trim();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function dedupeTrials(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${item.title}-${item.metadata?.status || ""}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function rankEvidence({ publications, trials, context }) {
  const rankedPublications = dedupePublications(publications)
    .map((item) => ({
      ...item,
      relevanceScore: scorePublication(item, context),
    }))
    .sort((left, right) => right.relevanceScore - left.relevanceScore);

  const rankedTrials = dedupeTrials(trials)
    .map((item) => ({
      ...item,
      relevanceScore: scoreTrial(item, context),
    }))
    .sort((left, right) => right.relevanceScore - left.relevanceScore);

  return {
    rankedPublications,
    rankedTrials,
    topPublications: rankedPublications.slice(0, 8),
    topTrials: rankedTrials.slice(0, 6),
  };
}
