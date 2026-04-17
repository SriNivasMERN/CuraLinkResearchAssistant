export function normalizeOpenAlexWork(work) {
  const authors =
    work.authorships?.map((authorship) => authorship.author?.display_name).filter(Boolean) || [];
  const abstract = buildOpenAlexAbstract(work.abstract_inverted_index);

  return {
    id: work.id || `openalex-${work.ids?.openalex || Math.random().toString(36).slice(2)}`,
    type: "publication",
    title: work.title || "Untitled publication",
    summary: abstract.slice(0, 1200),
    authors,
    year: work.publication_year || null,
    platform: "OpenAlex",
    url: work.primary_location?.landing_page_url || work.id || "",
    metadata: {
      citedByCount: work.cited_by_count || 0,
    },
  };
}

function buildOpenAlexAbstract(abstractInvertedIndex) {
  if (!abstractInvertedIndex) {
    return "";
  }

  const positionedTokens = [];

  for (const [word, positions] of Object.entries(abstractInvertedIndex)) {
    for (const position of positions) {
      positionedTokens[position] = word;
    }
  }

  return positionedTokens.filter(Boolean).join(" ");
}

export function normalizePubMedRecord(record) {
  const article =
    record?.MedlineCitation?.[0]?.Article?.[0] || record?.BookDocument?.[0]?.Article?.[0] || {};
  const title = article.ArticleTitle?.[0] || "Untitled publication";
  const abstract =
    article.Abstract?.[0]?.AbstractText?.map((item) =>
      typeof item === "string" ? item : item?._ || ""
    ).join(" ") || "";
  const authors =
    article.AuthorList?.[0]?.Author?.map((author) => {
      const foreName = author.ForeName?.[0] || "";
      const lastName = author.LastName?.[0] || "";
      return `${foreName} ${lastName}`.trim();
    }).filter(Boolean) || [];
  const pubDate =
    article.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.Year?.[0] ||
    record?.MedlineCitation?.[0]?.DateCompleted?.[0]?.Year?.[0] ||
    null;
  const pmid = record?.MedlineCitation?.[0]?.PMID?.[0]?._ || record?.MedlineCitation?.[0]?.PMID?.[0];

  return {
    id: `pubmed-${pmid || Math.random().toString(36).slice(2)}`,
    type: "publication",
    title,
    summary: abstract,
    authors,
    year: pubDate ? Number(pubDate) : null,
    platform: "PubMed",
    url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "",
    metadata: {
      pmid: pmid || "",
    },
  };
}

export function normalizeClinicalTrial(study) {
  const protocolSection = study.protocolSection || {};
  const identificationModule = protocolSection.identificationModule || {};
  const statusModule = protocolSection.statusModule || {};
  const eligibilityModule = protocolSection.eligibilityModule || {};
  const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
  const firstLocation = contactsLocationsModule.locations?.[0];

  return {
    id: study.protocolSection?.identificationModule?.nctId || Math.random().toString(36).slice(2),
    type: "trial",
    title: identificationModule.briefTitle || "Untitled clinical trial",
    summary: eligibilityModule.eligibilityCriteria || study.derivedSection?.miscInfoModule?.versionHolder || "",
    authors: [],
    year: null,
    platform: "ClinicalTrials.gov",
    url: identificationModule.nctId
      ? `https://clinicaltrials.gov/study/${identificationModule.nctId}`
      : "https://clinicaltrials.gov/",
    metadata: {
      status: statusModule.overallStatus || "",
      location: firstLocation
        ? [firstLocation.city, firstLocation.state, firstLocation.country].filter(Boolean).join(", ")
        : "",
      contact: contactsLocationsModule.centralContactList?.centralContacts?.[0]?.name || "",
    },
  };
}
