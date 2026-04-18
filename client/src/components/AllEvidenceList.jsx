import EvidenceSignals from "./EvidenceSignals";

function summarizeText(text) {
  const points = text
    ?.split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 1);

  return points?.length ? points : ["Evidence summary unavailable."];
}

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

function AllEvidenceList({ publications, trials }) {
  const mergedItems = [...publications, ...trials]
    .sort((left, right) => (right.relevanceScore || 0) - (left.relevanceScore || 0))
    .slice(0, 10);

  if (!mergedItems.length) {
    return <p className="muted-copy">No evidence returned yet.</p>;
  }

  return (
    <div className="card-list">
      {mergedItems.map((item) => {
        const isTrial = item.type === "trial";

        return (
          <article className={`result-card ${isTrial ? "trial-card" : "publication-card"}`} key={item.id}>
            <div className={`result-accent ${isTrial ? "trial-accent" : "publication-accent"}`} />
            <div className="result-meta">
              <span className="badge">{isTrial ? "Clinical trial" : "Publication"}</span>
              <span>{item.platform}</span>
              <span>{isTrial ? item.metadata?.status || "Status unavailable" : item.year || "Year unavailable"}</span>
              <span>Score {item.relevanceScore ?? "n/a"}</span>
            </div>
            <h3>{item.title}</h3>
            <div className="result-highlight-row">
              <div className="result-highlight">
                <span className="result-highlight-label">{isTrial ? "Location" : "Authors"}</span>
                <strong>{isTrial ? item.metadata?.location || "Location unavailable" : formatAuthors(item.authors)}</strong>
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
            {isTrial ? (
              <>
                <EvidenceSignals items={(item.matchedSignals || []).slice(0, 2)} />
                <p className="result-support-note">
                  Eligibility: {shorten(item.metadata?.eligibilityCriteria || "Eligibility unavailable", 100)}
                </p>
                <p className="result-support-note">
                  Location: {item.metadata?.location || "Location unavailable"}
                </p>
              </>
            ) : (
              <>
                <EvidenceSignals items={(item.matchedSignals || []).slice(0, 2)} />
                <p className="result-support-note">
                  Snippet: {shorten(item.metadata?.supportingSnippet || "No supporting snippet available", 100)}
                </p>
              </>
            )}
            <div className="result-footer">
              <span className="result-tag">{isTrial ? "Trial evidence" : "Publication evidence"}</span>
              <a href={item.url} rel="noreferrer" target="_blank">
                Open source
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default AllEvidenceList;
