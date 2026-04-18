function formatMix(items) {
  return items?.length ? items.join(" + ") : "Awaiting search";
}

function RetrievalSummary({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <section className="retrieval-summary">
      <div className="retrieval-summary-header">
        <div>
          <p className="eyebrow">Retrieval Summary</p>
          <h3>Depth first, then precision</h3>
        </div>
        <span className="snapshot-total">
          Showing {summary.shown?.total || 0} of {summary.ranked?.total || 0}
        </span>
      </div>

      <div className="retrieval-summary-grid">
        <div className="snapshot-card">
          <span className="snapshot-label">Retrieved pool</span>
          <strong>{summary.retrieved?.publications || 0} publications</strong>
          <p>{summary.retrieved?.trials || 0} clinical trials fetched before ranking</p>
        </div>
        <div className="snapshot-card">
          <span className="snapshot-label">Ranked set</span>
          <strong>{summary.ranked?.publications || 0} publications ranked</strong>
          <p>{summary.ranked?.trials || 0} clinical trials kept after dedupe and scoring</p>
        </div>
        <div className="snapshot-card">
          <span className="snapshot-label">Shown to user</span>
          <strong>{summary.shown?.publications || 0} publication cards</strong>
          <p>{summary.shown?.trials || 0} trial cards surfaced in the final response</p>
        </div>
        <div className="snapshot-card">
          <span className="snapshot-label">Source mix</span>
          <strong>{formatMix(summary.sourceMix)}</strong>
          <p>
            {summary.warningCount
              ? `${summary.warningCount} source warning(s) detected during retrieval`
              : "All active sources responded without warnings"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default RetrievalSummary;
