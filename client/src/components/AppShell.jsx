function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="topbar-label">CuraLink Hackathon Build</p>
          <h2 className="topbar-title">CuraLink Research Assistant</h2>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

export default AppShell;

