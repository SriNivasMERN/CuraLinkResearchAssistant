function renderList(items) {
  const compactItems = items?.slice(0, 2) || [];

  if (!compactItems.length) {
    return <p className="muted-copy">No evidence-backed points were generated for this section.</p>;
  }

  return (
    <ul className="insight-list">
      {compactItems.map((item, index) => (
        <li key={`${item}-${index}`}>{item.length > 140 ? `${item.slice(0, 137)}...` : item}</li>
      ))}
    </ul>
  );
}

function renderSentenceBullets(text, emptyMessage) {
  const points = text
    ?.split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 1);

  if (!points?.length) {
    return <p className="muted-copy">{emptyMessage}</p>;
  }

  return (
    <ul className="insight-list compact-list">
      {points.map((point, index) => (
        <li key={`${point}-${index}`}>{point}</li>
      ))}
    </ul>
  );
}

function AnswerPanel({ answer, context, warnings }) {
  if (!answer) {
    return (
      <div className="state-card">
        <p className="eyebrow">Structured Answer</p>
        <h3>Answer generation will appear here</h3>
        <p className="muted-copy">
          Day 2 adds grounded answer generation based on ranked publications and clinical trials.
        </p>
      </div>
    );
  }

  return (
    <div className="answer-panel">
      <div className="answer-header">
        <div>
          <p className="eyebrow">AI research synthesis</p>
          <h3>
            {context?.disease ? `${context.disease} research summary` : "Medical research summary"}
          </h3>
        </div>
        <span className="badge">{answer.generationMode === "ollama" ? "Ollama" : "Grounded fallback"}</span>
      </div>

      <div className="answer-meta-strip">
        <span className="summary-pill">
          <span className="summary-label">Context</span>
          {context?.disease || "General medical research"}
        </span>
        <span className="summary-pill">
          <span className="summary-label">Intent</span>
          {context?.intent || "Research exploration"}
        </span>
      </div>

      <div className="answer-grid">
        <div className="answer-section answer-section-card">
          <h4>Headline</h4>
          {renderSentenceBullets(answer.conditionOverview, "No condition overview was generated.")}
        </div>

        <div className="answer-section answer-section-card">
          <h4>Context fit</h4>
          {renderSentenceBullets(answer.personalizedContext, "No personalized context was generated.")}
        </div>

        <div className="answer-section answer-section-card">
          <h4>Research signal</h4>
          {renderList(answer.researchInsights)}
        </div>

        <div className="answer-section answer-section-card">
          <h4>Trial signal</h4>
          {renderList(answer.clinicalTrials)}
        </div>
      </div>

      <div className="answer-section answer-section-card">
        <h4>Risk check</h4>
        {renderSentenceBullets(answer.limitations, "No limitations were generated.")}
      </div>

      {(answer.generationError || warnings?.length) ? (
        <div className="answer-footer-note">
          {answer.generationError ? (
            <span className="muted-copy">Local model unavailable, grounded fallback used for this answer.</span>
          ) : null}
          {warnings?.length ? (
            <span className="muted-copy">{warnings.length} source warning(s) were detected during retrieval.</span>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}

export default AnswerPanel;
