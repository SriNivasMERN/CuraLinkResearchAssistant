import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/curalink-research-assistant",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.1:8b",
  openAlexPerPage: Number(process.env.OPENALEX_PER_PAGE || 60),
  pubmedRetmax: Number(process.env.PUBMED_RETMAX || 60),
  trialsPageSize: Number(process.env.CLINICAL_TRIALS_PAGE_SIZE || 40),
  publicationQueryCount: Number(process.env.PUBLICATION_QUERY_COUNT || 3),
};
