function LoadingState() {
  return (
    <div className="state-card">
      <p className="eyebrow">Working</p>
      <h3>Expanding, ranking, and retrieving medical evidence...</h3>
      <p className="muted-copy">
        The app is contacting OpenAlex, PubMed, ClinicalTrials.gov, and preparing a structured answer.
      </p>
      <div className="loading-steps">
        <span>Expanding query</span>
        <span>Retrieving sources</span>
        <span>Ranking evidence</span>
        <span>Preparing answer</span>
      </div>
    </div>
  );
}

export default LoadingState;
