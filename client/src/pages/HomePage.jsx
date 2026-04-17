import { useState } from "react";
import AppShell from "../components/AppShell";
import SearchComposer from "../components/SearchComposer";
import StructuredQueryForm from "../components/StructuredQueryForm";
import PublicationsList from "../components/PublicationsList";
import ClinicalTrialsList from "../components/ClinicalTrialsList";
import SectionCard from "../components/SectionCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import { searchResearch } from "../services/api";

const initialStructuredInput = {
  patientName: "",
  disease: "",
  intentQuery: "",
  location: "",
};

function HomePage() {
  const [query, setQuery] = useState("");
  const [structuredInput, setStructuredInput] = useState(initialStructuredInput);
  const [results, setResults] = useState({ publications: [], trials: [] });
  const [counts, setCounts] = useState({ publications: 0, trials: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim() && !structuredInput.intentQuery.trim() && !structuredInput.disease.trim()) {
      setError("Enter a research question or provide disease and intent details.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await searchResearch({
        query,
        structuredInput,
      });

      setResults({
        publications: response.publications || [],
        trials: response.trials || [],
      });
      setCounts(response.counts || { publications: 0, trials: 0 });
    } catch (requestError) {
      setError(requestError.message || "Unable to complete the research request.");
      setResults({ publications: [], trials: [] });
      setCounts({ publications: 0, trials: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="hero-card">
        <p className="eyebrow">AI Medical Research Workspace</p>
        <h1>CuraLink Research Assistant</h1>
        <p className="hero-copy">
          Search medical publications and clinical trials with a structured, evidence-first
          workflow designed for the Curalink hackathon.
        </p>
      </div>

      <SectionCard title="Research Query">
        <SearchComposer query={query} onQueryChange={setQuery} onSearch={handleSearch} />
        <StructuredQueryForm value={structuredInput} onChange={setStructuredInput} />
      </SectionCard>

      {error ? <ErrorBanner message={error} /> : null}
      {isLoading ? <LoadingState /> : null}

      {!isLoading && !error && counts.publications === 0 && counts.trials === 0 ? (
        <EmptyState />
      ) : null}

      {!isLoading && (counts.publications > 0 || counts.trials > 0) ? (
        <div className="results-grid">
          <SectionCard title={`Publications (${counts.publications})`}>
            <PublicationsList items={results.publications} />
          </SectionCard>
          <SectionCard title={`Clinical Trials (${counts.trials})`}>
            <ClinicalTrialsList items={results.trials} />
          </SectionCard>
        </div>
      ) : null}
    </AppShell>
  );
}

export default HomePage;

