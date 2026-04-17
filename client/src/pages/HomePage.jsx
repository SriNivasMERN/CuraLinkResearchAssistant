import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import SearchComposer from "../components/SearchComposer";
import StructuredQueryForm from "../components/StructuredQueryForm";
import PublicationsList from "../components/PublicationsList";
import ClinicalTrialsList from "../components/ClinicalTrialsList";
import SectionCard from "../components/SectionCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import AnswerPanel from "../components/AnswerPanel";
import ConversationSidebar from "../components/ConversationSidebar";
import QueryContextSummary from "../components/QueryContextSummary";
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
  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [error, setError] = useState("");

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
      setActiveResultTab("all");
      setConversationId(response.conversationId || "");
      const detail = await fetchConversationMessages(response.conversationId);
      setMessages(detail.messages || []);
      const loadedConversations = await fetchConversations();
      setConversations(loadedConversations);
    } catch (requestError) {
      setError(requestError.message || "Unable to complete the research request.");
      setResults({ publications: [], trials: [] });
      setCounts({ publications: 0, trials: 0 });
      setAnswer(null);
      setWarnings([]);
      setMessages([]);
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
      setMessages(detail.messages || []);
      setAnswer(detail.latestAssistantMetadata?.answer || null);
      setWarnings(detail.latestAssistantMetadata?.warnings || []);
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
        <div className="hero-query-grid">
          <div className="hero-card">
            <p className="eyebrow">AI Medical Research Workspace</p>
            <h1>CuraLink Research Assistant</h1>
            <p className="hero-copy">
              Search medical publications and clinical trials with a structured, evidence-first
              workflow designed for the Curalink hackathon.
            </p>
            <div className="hero-highlights">
              <div className="hero-highlight">
                <span className="hero-highlight-label">Publications</span>
                <strong>OpenAlex + PubMed</strong>
              </div>
              <div className="hero-highlight">
                <span className="hero-highlight-label">Trials</span>
                <strong>ClinicalTrials.gov</strong>
              </div>
              <div className="hero-highlight">
                <span className="hero-highlight-label">Output</span>
                <strong>Structured research guidance</strong>
              </div>
            </div>
            <QueryContextSummary context={context} />
          </div>

          <SectionCard title="Research Query" className="query-card">
            <SearchComposer query={query} onQueryChange={setQuery} onSearch={handleSearch} />
            <StructuredQueryForm value={structuredInput} onChange={setStructuredInput} />
            <div className="query-bridge">
              <span className="query-bridge-line" />
              <span className="query-bridge-chip">Search flows directly into ranked answer + evidence</span>
            </div>
          </SectionCard>
        </div>

        {error ? <ErrorBanner message={error} /> : null}
        {isLoading ? <LoadingState /> : null}

        {!isLoading && !error && !answer && counts.publications === 0 && counts.trials === 0 ? (
          <EmptyState />
        ) : null}

        <div className="workspace-layout">
          <div className="workspace-primary">
            {!isLoading ? (
              <SectionCard title="Structured Answer" className="answer-shell">
                <AnswerPanel answer={answer} context={context} warnings={warnings} />
              </SectionCard>
            ) : null}

            {!isLoading && (counts.publications > 0 || counts.trials > 0) ? (
              <div className="results-shell">
                <div className="results-shell-header">
                  <div>
                    <p className="eyebrow">Evidence Surface</p>
                    <h2>Ranked publications and live clinical trials</h2>
                  </div>
                  <div className="results-shell-stats">
                    <span className="result-tag">{counts.publications} publications</span>
                    <span className="result-tag">{counts.trials} trials</span>
                  </div>
                </div>

                <div className="results-tabbar">
                  <button
                    type="button"
                    className={`results-tab ${activeResultTab === "all" ? "results-tab-active" : ""}`}
                    onClick={() => setActiveResultTab("all")}
                  >
                    All evidence
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
                    Clinical trials
                  </button>
                </div>

                <div className="results-grid">
                  {(activeResultTab === "all" || activeResultTab === "publications") ? (
                    <SectionCard title={`Publications (${counts.publications})`} className="evidence-card evidence-card-publications">
                      <PublicationsList items={results.publications} />
                    </SectionCard>
                  ) : null}
                  {(activeResultTab === "all" || activeResultTab === "trials") ? (
                    <SectionCard title={`Clinical Trials (${counts.trials})`} className="evidence-card evidence-card-trials">
                      <ClinicalTrialsList items={results.trials} />
                    </SectionCard>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="workspace-secondary">
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              isLoading={isSidebarLoading}
            />

            {messages.length ? (
              <SectionCard title="Conversation Trace" className="conversation-trace-card">
                <div className="message-list">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}-${message.content}`}
                      className={`message-bubble message-${message.role}`}
                    >
                      <span className="message-role">{message.role}</span>
                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default HomePage;
