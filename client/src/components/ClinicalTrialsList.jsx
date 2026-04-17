function ClinicalTrialsList({ items }) {
  if (!items.length) {
    return <p className="muted-copy">No clinical trials returned yet.</p>;
  }

  return (
    <div className="card-list">
      {items.map((item) => (
        <article className="result-card" key={item.id}>
          <div className="result-meta">
            <span className="badge">{item.platform}</span>
            <span>{item.metadata?.status || "Status unavailable"}</span>
            <span>Score {item.relevanceScore ?? "n/a"}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.summary || "Eligibility or trial summary unavailable."}</p>
          <p className="muted-copy">
            Location: {item.metadata?.location || "Location unavailable"}
          </p>
          <p className="muted-copy">
            Contact: {item.metadata?.contact || "Contact unavailable"}
          </p>
          <a href={item.url} rel="noreferrer" target="_blank">
            Open source
          </a>
        </article>
      ))}
    </div>
  );
}

export default ClinicalTrialsList;
