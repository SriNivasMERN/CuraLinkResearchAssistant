import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import SearchComposer from "../components/SearchComposer";
import StructuredQueryForm from "../components/StructuredQueryForm";
import PublicationsList from "../components/PublicationsList";
import ClinicalTrialsList from "../components/ClinicalTrialsList";
import AllEvidenceList from "../components/AllEvidenceList";
import SectionCard from "../components/SectionCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import AnswerPanel from "../components/AnswerPanel";
import SourceAttributionList from "../components/SourceAttributionList";
import ConversationSidebar from "../components/ConversationSidebar";
import QueryContextSummary from "../components/QueryContextSummary";
import ResearchSnapshot from "../components/ResearchSnapshot";
import { fetchConversationMessages, fetchConversations, searchResearch } from "../services/api";

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
  const [activeResultTab, setActiveResultTab] = useState("all");
  const [answer, setAnswer] = useState(null);
  const [context, setContext] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [sourceAttribution, setSourceAttribution] = useState([]);
  const [retrievalSummary, setRetrievalSummary] = useState(null);
  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [error, setError] = useState("");
  const hasSearchWorkspace = !isLoading && (answer || counts.publications > 0 || counts.trials > 0 || conversations.length);
  const summarySourceLabel = retrievalSummary?.sourceMix?.length
    ? retrievalSummary.sourceMix.map((item) => item.replace("OpenAlex + PubMed", "Publications")).join(" + ")
    : "Awaiting search";
  const totalShown = (results.publications?.length || 0) + (results.trials?.length || 0);

  useEffect(() => {
    async function loadConversations() {
      setIsSidebarLoading(true);
      try {
        const loadedConversations = await fetchConversations();
        setConversations(loadedConversations);
      } catch (loadError) {
        console.error(loadError);
      } finally {
        setIsSidebarLoading(false);
      }
    }

    loadConversations();
  }, []);

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
        conversationId,
      });

      setResults({
        publications: response.publications || [],
        trials: response.trials || [],
      });
      setCounts(response.counts || { publications: 0, trials: 0 });
      setAnswer(response.answer || null);
      setContext(response.context || null);
      setWarnings(response.warnings || []);
      setSourceAttribution(response.sourceAttribution || []);
      setRetrievalSummary(response.retrievalSummary || null);
      setActiveResultTab("all");
      setConversationId(response.conversationId || "");
      await fetchConversationMessages(response.conversationId);
      const loadedConversations = await fetchConversations();
      setConversations(loadedConversations);
    } catch (requestError) {
      setError(requestError.message || "Unable to complete the research request.");
      setResults({ publications: [], trials: [] });
      setCounts({ publications: 0, trials: 0 });
      setAnswer(null);
      setWarnings([]);
      setSourceAttribution([]);
      setRetrievalSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = async (conversation) => {
    setIsSidebarLoading(true);
    setConversationId(conversation._id);
    setContext({
      disease: conversation.activeDiseaseContext,
      location: conversation.activeLocationContext,
      intent: "",
      expandedQueries: [],
    });
    setQuery("");
    setStructuredInput((currentValue) => ({
      ...currentValue,
      disease: conversation.activeDiseaseContext || "",
      location: conversation.activeLocationContext || "",
    }));

    try {
      const detail = await fetchConversationMessages(conversation._id);
      setAnswer(detail.latestAssistantMetadata?.answer || null);
      setWarnings(detail.latestAssistantMetadata?.warnings || []);
      setSourceAttribution(detail.latestAssistantMetadata?.sourceAttribution || []);
      setRetrievalSummary(detail.latestAssistantMetadata?.retrievalSummary || null);
      setContext(detail.latestAssistantMetadata?.context || null);
      setActiveResultTab("all");
      setResults({
        publications: detail.latestAssistantMetadata?.publications || [],
        trials: detail.latestAssistantMetadata?.trials || [],
      });
      setCounts(detail.latestAssistantMetadata?.counts || { publications: 0, trials: 0 });
    } catch (loadError) {
      console.error(loadError);
    } finally {
      setIsSidebarLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="workspace-main">
        <SectionCard
          title="Medical Research Workspace"
          subtitle="Search evidence, compare publications and trials, and keep the research thread moving without losing context."
          className="query-card query-card-expanded"
        >
          <div className="command-deck">
            <div className="command-story">
              <div className="query-card-intro">
                <p className="eyebrow">CuraLink</p>
                <div className="query-quick-points">
                  <span className="quick-pill">Publications</span>
                  <span className="quick-pill">Trials</span>
                  <span className="quick-pill">Context-aware answers</span>
                </div>
              </div>
              <div className="command-copy">
                <h3>One workspace for live medical research thinking.</h3>
                <p>
                  Ask a question, scan ranked evidence, and keep follow-up context moving without resetting the thread.
                </p>
              </div>
            </div>
            <div className="command-metrics">
              <div className="command-metric-card">
                <span className="command-metric-label">Research mode</span>
                <strong>Evidence-first</strong>
                <p>Publications, trials, and source-backed summaries in one flow.</p>
              </div>
              <div className="command-metric-card">
                <span className="command-metric-label">Best for</span>
                <strong>Treatment paths</strong>
                <p>Compare therapies, supplements, and trial options without leaving context.</p>
              </div>
            </div>
          </div>

          <div className="command-input-shell">
            <div className="command-input-header">
              <div>
                <p className="eyebrow">Research Query</p>
                <h3>Launch a new search lane</h3>
              </div>
              <span className="command-status-pill">Live workspace</span>
            </div>
            <SearchComposer query={query} onQueryChange={setQuery} onSearch={handleSearch} />
            <StructuredQueryForm value={structuredInput} onChange={setStructuredInput} />
            <QueryContextSummary context={context} />
          </div>
        </SectionCard>

        {error ? <ErrorBanner message={error} /> : null}
        {isLoading ? <LoadingState /> : null}

        {!isLoading && !error && !answer && counts.publications === 0 && counts.trials === 0 ? (
          <EmptyState />
        ) : null}

        {hasSearchWorkspace ? (
          <div className="app-workspace">
            <div className="workspace-column">
              {retrievalSummary ? (
                <div className="summary-strip">
                  <span className="summary-pill">
                    <span className="summary-label">Topic</span>
                    {context?.disease || "General research"}
                  </span>
                  <span className="summary-pill">
                    <span className="summary-label">Pipeline</span>
                    {retrievalSummary.retrieved?.total || 0}
                  </span>
                  <span className="summary-pill">
                    <span className="summary-label">Live now</span>
                    {totalShown}
                  </span>
                  <span className="summary-pill">
                    <span className="summary-label">Stack</span>
                    {summarySourceLabel}
                  </span>
                </div>
              ) : null}

              {answer ? (
                <SectionCard
                  title="Research Brief"
                  className="answer-shell compact-answer-shell"
                >
                  <AnswerPanel
                    answer={answer}
                    context={context}
                    warnings={warnings}
                  />
                </SectionCard>
              ) : null}

              {(counts.publications > 0 || counts.trials > 0) ? (
                <div className="results-shell">
                  <div className="results-shell-header">
                    <div>
                      <p className="eyebrow">Evidence</p>
                      <h2>Evidence board</h2>
                      <p className="results-shell-copy">Switch between the mixed feed, publications, trials, and direct source support.</p>
                    </div>
                    <div className="results-shell-stats">
                      <span className="result-tag">
                        {results.publications.length}/{counts.publications} publication cards
                      </span>
                      <span className="result-tag">
                        {results.trials.length}/{counts.trials} trial cards
                      </span>
                    </div>
                  </div>

                  <div className="results-tabbar">
                    <button
                      type="button"
                      className={`results-tab ${activeResultTab === "all" ? "results-tab-active" : ""}`}
                      onClick={() => setActiveResultTab("all")}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`results-tab ${activeResultTab === "publications" ? "results-tab-active" : ""}`}
                      onClick={() => setActiveResultTab("publications")}
                    >
                      Publications
                    </button>
                    <button
                      type="button"
                      className={`results-tab ${activeResultTab === "trials" ? "results-tab-active" : ""}`}
                      onClick={() => setActiveResultTab("trials")}
                    >
                      Trials
                    </button>
                    <button
                      type="button"
                      className={`results-tab ${activeResultTab === "sources" ? "results-tab-active" : ""}`}
                      onClick={() => setActiveResultTab("sources")}
                    >
                      Sources
                    </button>
                  </div>

                  <div className="results-grid">
                    {activeResultTab === "all" ? (
                      <SectionCard
                        title="Top Evidence"
                        className="evidence-card evidence-card-all"
                      >
                        <AllEvidenceList publications={results.publications} trials={results.trials} />
                      </SectionCard>
                    ) : null}
                    {activeResultTab === "publications" ? (
                      <SectionCard
                        title="Publications"
                        className="evidence-card evidence-card-publications"
                      >
                        <PublicationsList items={results.publications} />
                      </SectionCard>
                    ) : null}
                    {activeResultTab === "trials" ? (
                      <SectionCard
                        title="Clinical Trials"
                        className="evidence-card evidence-card-trials"
                      >
                        <ClinicalTrialsList items={results.trials} />
                      </SectionCard>
                    ) : null}
                    {activeResultTab === "sources" ? (
                      <SectionCard
                        title="Sources"
                        className="evidence-card evidence-card-sources"
                      >
                        <SourceAttributionList sources={sourceAttribution} />
                      </SectionCard>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="workspace-rail">
              {(context || conversations.length) ? (
                <>
                  <ResearchSnapshot
                    context={context}
                    counts={counts}
                    warnings={warnings}
                    retrievalSummary={retrievalSummary}
                  />
                  <ConversationSidebar
                    conversations={conversations}
                    activeConversationId={conversationId}
                    onSelectConversation={handleSelectConversation}
                    isLoading={isSidebarLoading}
                    className="conversation-sidebar-top"
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

export default HomePage;
