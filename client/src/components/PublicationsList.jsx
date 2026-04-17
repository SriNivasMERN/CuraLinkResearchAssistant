function summarizeText(text) {
  const points = text
    ?.split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return points?.length ? points : ["Summary unavailable."];
}

function PublicationsList({ items }) {
  if (!items.length) {
    return <p className="muted-copy">No publications returned yet.</p>;
  }

  return (
    <div className="card-list">
      {items.map((item) => (
        <article className="result-card publication-card" key={item.id}>
          <div className="result-accent publication-accent" />
          <div className="result-meta">
            <span className="badge">{item.platform}</span>
            <span>{item.year || "Year unavailable"}</span>
            <span>Score {item.relevanceScore ?? "n/a"}</span>
          </div>
          <h3>{item.title}</h3>
          <ul className="result-bullet-list">
            {summarizeText(item.summary).map((point, index) => (
              <li key={`${item.id}-summary-${index}`}>{point}</li>
            ))}
          </ul>
          <p className="muted-copy">Authors: {item.authors?.length ? item.authors.join(", ") : "Unknown"}</p>
          <div className="result-footer">
            <span className="result-tag">Publication evidence</span>
            <a href={item.url} rel="noreferrer" target="_blank">
              Open source
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default PublicationsList;
