function renderList(items) {
  if (!items?.length) {
    return <p className="muted-copy">No evidence-backed points were generated for this section.</p>;
  }

  return (
    <ul className="insight-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
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
          <p className="eyebrow">Structured Answer</p>
          <h3>
            {context?.disease ? `${context.disease} research summary` : "Medical research summary"}
          </h3>
        </div>
        <span className="badge">{answer.generationMode === "ollama" ? "Ollama" : "Grounded fallback"}</span>
      </div>

      <div className="answer-section">
        <h4>Condition Overview</h4>
        <p>{answer.conditionOverview}</p>
      </div>

      <div className="answer-section">
        <h4>Personalized Context</h4>
        <p>{answer.personalizedContext}</p>
      </div>

      <div className="answer-section">
        <h4>Research Insights</h4>
        {renderList(answer.researchInsights)}
      </div>

      <div className="answer-section">
        <h4>Clinical Trials</h4>
        {renderList(answer.clinicalTrials)}
      </div>

      {answer.generationError ? (
        <div className="warning-card">
          <strong>Reasoning fallback active</strong>
          <p className="muted-copy">
            The structured answer is using the grounded fallback path because the local model endpoint
            was not available during this request.
          </p>
        </div>
      ) : null}

      <div className="answer-section">
        <h4>Limitations</h4>
        <p>{answer.limitations}</p>
      </div>

      {warnings?.length ? (
        <div className="warning-card">
          <strong>Source warnings</strong>
          <ul className="warning-list">
            {warnings.map((warning, index) => (
              <li key={`${warning}-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default AnswerPanel;
