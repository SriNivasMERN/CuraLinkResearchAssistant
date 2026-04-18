import EvidenceSignals from "./EvidenceSignals";

function shorten(text = "", limit = 105) {
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
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

function SourceAttributionList({ sources = [] }) {
  if (!sources.length) {
    return <p className="muted-copy">No source attribution is available for this response.</p>;
  }

  return (
    <div className="source-attribution-list">
      {sources.map((source) => (
        <article className="source-attribution-card" key={source.id}>
          <div className="result-meta">
            <span className="badge">{source.platform}</span>
            <span>{source.year || "Year unavailable"}</span>
            <span>{source.type === "trial" ? "Trial support" : "Publication support"}</span>
          </div>
          <h5>{source.title}</h5>
          <p className="muted-copy">
            Authors: {formatAuthors(source.authors)}
          </p>
          <p className="result-support-note">{shorten(source.snippet)}</p>
          {source.type === "trial" ? (
            <div className="source-extra">
              <p className="muted-copy">
                Status: {source.metadata?.status || "Status unavailable"}
              </p>
              <p className="muted-copy">
                Eligibility: {shorten(source.metadata?.eligibilityCriteria || "Eligibility unavailable", 95)}
              </p>
            </div>
          ) : null}
          <EvidenceSignals items={(source.metadata?.matchedSignals || []).slice(0, 2)} />
          <a href={source.url} rel="noreferrer" target="_blank">
            Open source
          </a>
        </article>
      ))}
    </div>
  );
}

export default SourceAttributionList;
