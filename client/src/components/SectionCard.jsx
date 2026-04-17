function SectionCard({ title, children }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default SectionCard;

