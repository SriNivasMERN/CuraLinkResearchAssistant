function PublicationsList({ items }) {
  if (!items.length) {
    return <p className="muted-copy">No publications returned yet.</p>;
  }

  return (
    <div className="card-list">
      {items.map((item) => (
        <article className="result-card" key={item.id}>
          <div className="result-meta">
            <span className="badge">{item.platform}</span>
            <span>{item.year || "Year unavailable"}</span>
          </div>
          <h3>{item.title}</h3>
          <p>{item.summary || "Summary unavailable."}</p>
          <p className="muted-copy">Authors: {item.authors?.length ? item.authors.join(", ") : "Unknown"}</p>
          <a href={item.url} rel="noreferrer" target="_blank">
            Open source
          </a>
        </article>
      ))}
    </div>
  );
}

export default PublicationsList;

