export function HomeFooter({ version }: { version: string }) {
  return (
    <footer className="home-footer" data-testid="home-footer">
      <span data-testid="home-footer-brand">Love Shuffle</span>
      <span data-testid="app-version">Version {version}</span>
    </footer>
  );
}
