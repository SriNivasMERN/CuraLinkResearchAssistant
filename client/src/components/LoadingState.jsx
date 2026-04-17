function LoadingState() {
  return (
    <div className="loading-shell">
      <div className="loading-visual">
        <div className="loading-ring loading-ring-one" />
        <div className="loading-ring loading-ring-two" />
        <div className="loading-orbit loading-orbit-one" />
        <div className="loading-orbit loading-orbit-two" />
        <div className="loading-core">AI</div>
      </div>
      <div className="loading-copy">
        <p className="eyebrow">Research In Progress</p>
        <h3>Building a connected answer from publications and trials...</h3>
        <p className="muted-copy">
          The app is expanding the query, scanning medical sources, ranking evidence, and shaping a grounded response.
        </p>
        <div className="loading-steps">
          <span>Expand context</span>
          <span>Scan sources</span>
          <span>Rank findings</span>
          <span>Compose answer</span>
        </div>
        <div className="loading-signal">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
