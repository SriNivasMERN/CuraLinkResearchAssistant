import EvidenceSignals from "./EvidenceSignals";

function summarizeText(text) {
  const points = text
    ?.split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 1);

  return points?.length ? points : ["Summary unavailable."];
}

function formatAuthors(authors = []) {
  if (!authors.length) {
    return "Unknown";
  }

  if (authors.length <= 3) {
    return authors.join(", ");
  }

  return `${authors.slice(0, 3).join(", ")} +${authors.length - 3} more`;
}

function shorten(text = "", limit = 110) {
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function PublicationsList({ items }) {
  if (!items.length) {
    return <p className="muted-copy">No publications returned yet.</p>;
  }

  return (
    <div className="card-list">
      {items.map((item, index) => (
        <article className="result-card publication-card" key={item.id}>
          <div className="result-accent publication-accent" />
          <div className="result-meta">
            <span className="result-index-badge">Study {index + 1}</span>
            <span className="badge">{item.platform}</span>
            <span>{item.year || "Year unavailable"}</span>
            <span>Score {item.relevanceScore ?? "n/a"}</span>
          </div>
          <h3>{item.title}</h3>
          <div className="result-highlight-row">
            <div className="result-highlight">
              <span className="result-highlight-label">Authors</span>
              <strong>{formatAuthors(item.authors)}</strong>
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
            Snippet: {shorten(item.metadata?.supportingSnippet || "No supporting snippet available", 100)}
          </p>
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
