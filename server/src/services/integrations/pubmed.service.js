import { parseStringPromise } from "xml2js";
import httpClient from "./httpClient.js";
import { normalizePubMedRecord } from "../../utils/sourceNormalizer.js";

async function searchPubMedIds(query) {
  const response = await httpClient.get(
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
    {
      params: {
        db: "pubmed",
        term: query,
        retmax: 10,
        sort: "pub+date",
        retmode: "json",
      },
    }
  );

  return response.data?.esearchresult?.idlist || [];
}

async function fetchPubMedDetails(ids) {
  if (!ids.length) {
    return [];
  }

  const response = await httpClient.get(
    "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
    {
      params: {
        db: "pubmed",
        id: ids.join(","),
        retmode: "xml",
      },
    }
  );

  const parsed = await parseStringPromise(response.data);
  return parsed?.PubmedArticleSet?.PubmedArticle || [];
}

export async function searchPubMed(query) {
  if (!query) {
    return [];
  }

  const ids = await searchPubMedIds(query);
  const records = await fetchPubMedDetails(ids);
  return records.map(normalizePubMedRecord);
}

