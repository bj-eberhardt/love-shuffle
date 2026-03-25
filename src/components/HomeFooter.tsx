export function HomeFooter({ version }: { version: string }) {
  return (
    <footer className="home-footer">
      <span>Love Shuffle</span>
      <span>Version {version}</span>
    </footer>
  );
}
