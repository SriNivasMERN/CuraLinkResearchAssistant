function SectionCard({ title, subtitle = "", children, className = "" }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      <div className="section-header">
        <h2>{title}</h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default SectionCard;
