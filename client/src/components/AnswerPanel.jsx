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
        <p className="eyebrow">Quick Summary</p>
        <h3>Your easy summary will appear here</h3>
        <p className="muted-copy">
          After you search, this area will show the main answer in simple language.
        </p>
      </div>
    );
  }

  return (
    <div className="answer-panel">
      <div className="answer-header">
        <div>
          <p className="eyebrow">AI Summary</p>
          <h3>
            {context?.disease ? `${context.disease} - quick summary` : "Quick medical research summary"}
          </h3>
        </div>
        <span className="badge">{answer.generationMode === "ollama" ? "AI model" : "Backup mode"}</span>
      </div>

      <div className="answer-meta-strip">
        <span className="summary-pill">
          <span className="summary-label">Topic</span>
          {context?.disease || "General health question"}
        </span>
        <span className="summary-pill">
          <span className="summary-label">Focus</span>
          {context?.intent || "General information"}
        </span>
      </div>

      <div className="answer-grid">
        <div className="answer-section answer-section-card">
          <span className="answer-step">01</span>
          <h4>Big Picture</h4>
          {renderSentenceBullets(answer.conditionOverview, "No short overview is available yet.")}
        </div>

        <div className="answer-section answer-section-card">
          <span className="answer-step">02</span>
          <h4>Why This Fits Your Question</h4>
          {renderSentenceBullets(answer.personalizedContext, "No question-specific explanation is available yet.")}
        </div>

        <div className="answer-section answer-section-card">
          <span className="answer-step">03</span>
          <h4>What The Studies Suggest</h4>
          {renderList(answer.researchInsights)}
        </div>

        <div className="answer-section answer-section-card">
          <span className="answer-step">04</span>
          <h4>What The Trials Show</h4>
          {renderList(answer.clinicalTrials)}
        </div>
      </div>

      <div className="answer-section answer-section-card">
        <span className="answer-step">05</span>
        <h4>What To Be Careful About</h4>
        {renderSentenceBullets(answer.limitations, "No caution notes are available yet.")}
      </div>

      {(answer.generationError || warnings?.length) ? (
        <div className="answer-footer-note">
          {answer.generationError ? (
            <span className="muted-copy">The main AI model was unavailable, so the app used a backup summary.</span>
          ) : null}
          {warnings?.length ? (
            <span className="muted-copy">{warnings.length} source warning(s) appeared while gathering results.</span>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}

export default AnswerPanel;
