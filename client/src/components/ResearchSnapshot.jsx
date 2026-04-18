function ResearchSnapshot({ context, counts, warnings, retrievalSummary }) {
  const sourceMix = [];

  if (retrievalSummary?.sourceMix?.length) {
    sourceMix.push(...retrievalSummary.sourceMix);
  } else if (counts?.publications) {
    sourceMix.push("OpenAlex + PubMed");
  }

  if (counts?.trials) {
    sourceMix.push("ClinicalTrials.gov");
  }

  const sourceLabel = sourceMix.length
    ? sourceMix.map((item) => item.replace("OpenAlex + PubMed", "Publications")).join(" + ")
    : "Awaiting search";

  return (
    <section className="snapshot-panel">
      <div className="snapshot-header">
        <div>
          <p className="eyebrow">At A Glance</p>
          <h2>What This Search Found</h2>
        </div>
        <div className="snapshot-total">{(counts?.publications || 0) + (counts?.trials || 0)} results</div>
      </div>

      <div className="snapshot-inline-stats">
        <span className="summary-pill">
          <span className="summary-label">Topic</span>
          {context?.disease || "General research"}
        </span>
        <span className="summary-pill">
          <span className="summary-label">Sources</span>
          {sourceLabel}
        </span>
      </div>

      <div className="snapshot-grid">
        <div className="snapshot-card snapshot-card-focus">
          <span className="snapshot-label">Your Question</span>
          <strong>{context?.intent || "General health research"}</strong>
          <p>{context?.location || "No location chosen"}</p>
        </div>

        <div className="snapshot-card snapshot-card-coverage">
          <span className="snapshot-label">On The Board</span>
          <strong>
            Showing {retrievalSummary?.shown?.publications || counts?.publications || 0} studies
          </strong>
          <p>
            {retrievalSummary?.shown?.trials || counts?.trials || 0} trials are visible right now
          </p>
        </div>

        <div className="snapshot-card snapshot-card-status">
          <span className="snapshot-label">Source Check</span>
          <strong>{warnings?.length ? `${warnings.length} source warning(s)` : "Sources are working"}</strong>
          <p>{warnings?.length ? "Some sources returned warnings" : "No source problems were detected"}</p>
        </div>

        {retrievalSummary ? (
          <div className="snapshot-card snapshot-card-depth">
            <span className="snapshot-label">Search Depth</span>
            <strong>{retrievalSummary.retrieved?.total || 0} results were checked</strong>
            <p>{retrievalSummary.ranked?.total || 0} stayed after sorting and cleanup</p>
          </div>
        ) : null}
      </div>

      {context?.expandedQueries?.length ? (
        <div className="snapshot-query-trail">
          <span className="snapshot-label">Search Phrases Used</span>
          <div className="snapshot-chip-row">
            {context.expandedQueries.slice(0, 2).map((item, index) => (
              <span className="snapshot-chip" key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ResearchSnapshot;
