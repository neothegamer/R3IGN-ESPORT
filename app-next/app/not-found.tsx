export const metadata = {
  title: "Page Not Found · R3IGN HQ",
  description: "This page doesn't exist — return to the R3IGN HQ homepage.",
};

export default function NotFound() {
  return (
    <main id="main-content">
      <div className="wrap">
        <div className="error-page">
          <span className="code">Error 404</span>
          <h1>Page Not Found</h1>
          <p>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Double-check the link, or head back to somewhere useful.
          </p>
          <div className="hero-actions">
            <a href="/" className="btn btn-primary">
              Back to Home
            </a>
            <a href="/support" className="btn btn-ghost">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}