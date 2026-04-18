function normalizeText(value) {
  return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function includesKeyword(text, keyword) {
  if (!text || !keyword) {
    return false;
  }

  return text.includes(normalizeText(keyword));
}

function calculateKeywordScore(text, keyword) {
  if (!text || !keyword) {
    return 0;
  }

  return includesKeyword(text, keyword) ? 1 : 0;
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

function buildPublicationReasons(item, context, searchableText) {
  const reasons = [];

  if (calculateKeywordScore(searchableText, context.disease)) {
    reasons.push(`Matched disease: ${context.disease}`);
  }

  if (calculateKeywordScore(searchableText, context.intent)) {
    reasons.push(`Matched intent: ${context.intent}`);
  }

  if (item.year && calculateRecencyBoost(item.year) >= 1.2) {
    reasons.push(`Recent publication: ${item.year}`);
  }

  if ((item.metadata?.citedByCount || 0) >= 25) {
    reasons.push(`Credibility signal: ${item.metadata.citedByCount} citations`);
  }

  if (item.platform === "PubMed") {
    reasons.push("High-trust publication source");
  }

  return reasons.slice(0, 4);
}

function scorePublication(item, context, searchableText) {
  const diseaseScore = calculateKeywordScore(searchableText, context.disease) * 3;
  const intentScore = calculateKeywordScore(searchableText, context.intent) * 2.4;
  const recencyBoost = calculateRecencyBoost(item.year);
  const metadataBoost = calculateMetadataBoost(item);
  const sourceBoost = item.platform === "PubMed" ? 1.4 : 1;
  const citationBoost = Math.min((item.metadata?.citedByCount || 0) / 200, 0.8);

  return Number((diseaseScore + intentScore + recencyBoost + metadataBoost + sourceBoost + citationBoost).toFixed(2));
}

function buildTrialReasons(item, context, searchableText) {
  const reasons = [];

  if (calculateKeywordScore(searchableText, context.disease)) {
    reasons.push(`Matched disease: ${context.disease}`);
  }

  if (calculateKeywordScore(searchableText, context.intent)) {
    reasons.push(`Matched intent: ${context.intent}`);
  }

  if (/recruiting|active|not yet recruiting/i.test(item.metadata?.status || "")) {
    reasons.push(`Trial status: ${item.metadata.status}`);
  }

  if (
    context.location &&
    item.metadata?.location?.toLowerCase().includes(context.location.toLowerCase())
  ) {
    reasons.push(`Location fit: ${item.metadata.location}`);
  }

  if (item.metadata?.eligibilityCriteria) {
    reasons.push("Eligibility criteria available");
  }

  return reasons.slice(0, 4);
}

function scoreTrial(item, context, searchableText) {
  const diseaseScore = calculateKeywordScore(searchableText, context.disease) * 3;
  const intentScore = calculateKeywordScore(searchableText, context.intent) * 2;
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

function buildPublicationSearchText(item, context) {
  return normalizeText(
    [
      item.title,
      item.summary,
      item.metadata?.supportingSnippet,
      context.query,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function buildTrialSearchText(item, context) {
  return normalizeText(
    [
      item.title,
      item.summary,
      item.metadata?.status,
      item.metadata?.eligibilityCriteria,
      item.metadata?.location,
      context.query,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function enrichPublication(item, context) {
  const searchableText = buildPublicationSearchText(item, context);

  return {
    ...item,
    relevanceScore: scorePublication(item, context, searchableText),
    matchedSignals: buildPublicationReasons(item, context, searchableText),
  };
}

function enrichTrial(item, context) {
  const searchableText = buildTrialSearchText(item, context);

  return {
    ...item,
    relevanceScore: scoreTrial(item, context, searchableText),
    matchedSignals: buildTrialReasons(item, context, searchableText),
  };
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
    .map((item) => enrichPublication(item, context))
    .sort((left, right) => right.relevanceScore - left.relevanceScore);

  const rankedTrials = dedupeTrials(trials)
    .map((item) => enrichTrial(item, context))
    .sort((left, right) => right.relevanceScore - left.relevanceScore);

  return {
    rankedPublications,
    rankedTrials,
    topPublications: rankedPublications.slice(0, 8),
    topTrials: rankedTrials.slice(0, 8),
  };
}
