function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="scroll-beam" aria-hidden="true" />
      <div className="ambient-layer" aria-hidden="true">
        <span className="ambient-orb ambient-orb-one" />
        <span className="ambient-orb ambient-orb-two" />
        <span className="ambient-orb ambient-orb-three" />
        <span className="ambient-grid" />
        <span className="ambient-wave ambient-wave-one" />
        <span className="ambient-wave ambient-wave-two" />
      </div>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <span className="brand-mark-core" />
            </div>
            <div>
            <p className="topbar-label">Clinical Research Workspace</p>
            <h2 className="topbar-title">CuraLink Research Assistant</h2>
            </div>
          </div>
          <div className="topbar-pill">Source-backed medical research</div>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

export default AppShell;
