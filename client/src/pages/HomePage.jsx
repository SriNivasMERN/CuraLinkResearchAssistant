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
      <div className="workspace-layout">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          isLoading={isSidebarLoading}
        />

        <div className="workspace-main">
          <div className="hero-card">
            <p className="eyebrow">AI Medical Research Workspace</p>
            <h1>CuraLink Research Assistant</h1>
            <p className="hero-copy">
              Search medical publications and clinical trials with a structured, evidence-first
              workflow designed for the Curalink hackathon.
            </p>
            <QueryContextSummary context={context} />
          </div>

          <SectionCard title="Research Query">
            <SearchComposer query={query} onQueryChange={setQuery} onSearch={handleSearch} />
            <StructuredQueryForm value={structuredInput} onChange={setStructuredInput} />
          </SectionCard>

          {error ? <ErrorBanner message={error} /> : null}
          {isLoading ? <LoadingState /> : null}

          {!isLoading && !error && !answer && counts.publications === 0 && counts.trials === 0 ? (
            <EmptyState />
          ) : null}

          {!isLoading ? (
            <SectionCard title="Structured Answer">
              <AnswerPanel answer={answer} context={context} warnings={warnings} />
            </SectionCard>
          ) : null}

          {messages.length ? (
            <SectionCard title="Conversation Trace">
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
        </div>
      </div>
    </AppShell>
  );
}

export default HomePage;
