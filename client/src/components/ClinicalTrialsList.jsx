function summarizeText(text) {
  const points = text
    ?.split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return points?.length ? points : ["Eligibility or trial summary unavailable."];
}

function ClinicalTrialsList({ items }) {
  if (!items.length) {
    return <p className="muted-copy">No clinical trials returned yet.</p>;
  }

  return (
    <div className="card-list">
      {items.map((item) => (
        <article className="result-card trial-card" key={item.id}>
          <div className="result-accent trial-accent" />
          <div className="result-meta">
            <span className="badge">{item.platform}</span>
            <span>{item.metadata?.status || "Status unavailable"}</span>
            <span>Score {item.relevanceScore ?? "n/a"}</span>
          </div>
          <h3>{item.title}</h3>
          <ul className="result-bullet-list">
            {summarizeText(item.summary).map((point, index) => (
              <li key={`${item.id}-summary-${index}`}>{point}</li>
            ))}
          </ul>
          <p className="muted-copy">
            Location: {item.metadata?.location || "Location unavailable"}
          </p>
          <p className="muted-copy">
            Contact: {item.metadata?.contact || "Contact unavailable"}
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
