import React from "react";

// Catches render errors anywhere below it so the user gets a recovery screen
// instead of a blank page.
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="page">
        <section className="card card--narrow" role="alert">
          <header className="card__header">
            <h1>Something went wrong</h1>
            <p>An unexpected error occurred. Reloading usually fixes it.</p>
          </header>
          <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
