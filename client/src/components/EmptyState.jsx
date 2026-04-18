function EmptyState() {
  return (
    <div className="state-card">
      <p className="eyebrow">Ready</p>
      <h3>Start with a simple health question</h3>
      <p className="muted-copy">
        Try questions like "Latest treatment for lung cancer" or "Clinical trials for diabetes".
      </p>
      <div className="empty-state-flow">
        <div className="empty-step">
          <strong>1. Ask</strong>
          <p>Type a disease, treatment, supplement, or trial question.</p>
        </div>
        <div className="empty-step">
          <strong>2. Read</strong>
          <p>See the short answer, studies, and trial results in one place.</p>
        </div>
        <div className="empty-step">
          <strong>3. Ask Again</strong>
          <p>Use follow-up questions to stay on the same health topic.</p>
        </div>
      </div>
      <div className="example-grid">
        <span className="example-chip">Latest treatment for lung cancer</span>
        <span className="example-chip">Clinical trials for diabetes</span>
        <span className="example-chip">Parkinson&apos;s disease deep brain stimulation</span>
      </div>
    </div>
  );
}

export default EmptyState;
