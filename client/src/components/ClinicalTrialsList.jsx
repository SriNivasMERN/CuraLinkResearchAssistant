import EvidenceSignals from "./EvidenceSignals";

function summarizeText(text) {
  const points = text
    ?.split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 1);

  return points?.length ? points : ["Eligibility or trial summary unavailable."];
}

function shorten(text = "", limit = 105) {
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function ClinicalTrialsList({ items }) {
  if (!items.length) {
    return <p className="muted-copy">No clinical trials returned yet.</p>;
  }

  return (
    <div className="card-list">
      {items.map((item, index) => (
        <article className="result-card trial-card" key={item.id}>
          <div className="result-accent trial-accent" />
          <div className="result-meta">
            <span className="result-index-badge">Trial {index + 1}</span>
            <span className="badge">{item.platform}</span>
            <span>{item.metadata?.status || "Status unavailable"}</span>
            <span>Score {item.relevanceScore ?? "n/a"}</span>
          </div>
          <h3>{item.title}</h3>
          <div className="result-highlight-row">
            <div className="result-highlight">
              <span className="result-highlight-label">Location</span>
              <strong>{item.metadata?.location || "Location unavailable"}</strong>
            </div>
            <div className="result-highlight">
              <span className="result-highlight-label">Fit</span>
              <strong>{(item.matchedSignals || []).slice(0, 1)[0] || "Relevance scored"}</strong>
            </div>
          </div>
          <ul className="result-bullet-list">
            {summarizeText(item.summary).map((point, index) => (
              <li key={`${item.id}-summary-${index}`}>{shorten(point)}</li>
            ))}
          </ul>
          <EvidenceSignals items={(item.matchedSignals || []).slice(0, 2)} />
          <p className="result-support-note">
            Eligibility: {shorten(item.metadata?.eligibilityCriteria || "Eligibility unavailable", 100)}
          </p>
          <div className="result-footer">
            <span className="result-tag">Trial evidence</span>
            <a href={item.url} rel="noreferrer" target="_blank">
              Open source
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ClinicalTrialsList;
