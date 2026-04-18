function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="scroll-beam" aria-hidden="true" />
      <main className="content">{children}</main>
    </div>
  );
}

export default AppShell;
