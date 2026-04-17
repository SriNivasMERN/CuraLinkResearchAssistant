function QueryContextSummary({ context }) {
  if (!context) {
    return null;
  }

  return (
    <div className="context-summary">
      <span className="context-chip">Disease: {context.disease || "Not inferred"}</span>
      <span className="context-chip">Intent: {context.intent || "General research"}</span>
      {context.location ? <span className="context-chip">Location: {context.location}</span> : null}
      {context.expandedQueries?.length ? (
        <span className="context-chip">Expanded queries: {context.expandedQueries.length}</span>
      ) : null}
    </div>
  );
}

export default QueryContextSummary;
