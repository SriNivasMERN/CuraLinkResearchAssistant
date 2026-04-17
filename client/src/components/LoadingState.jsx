function LoadingState() {
  return (
    <div className="state-card">
      <p className="eyebrow">Working</p>
      <h3>Retrieving medical research sources...</h3>
      <p className="muted-copy">
        The app is contacting OpenAlex, PubMed, and ClinicalTrials.gov.
      </p>
    </div>
  );
}

export default LoadingState;

