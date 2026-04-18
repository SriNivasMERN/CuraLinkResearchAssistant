function EvidenceSignals({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="signal-chip-row">
      {items.map((item, index) => (
        <span className="signal-chip" key={`${item}-${index}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default EvidenceSignals;
