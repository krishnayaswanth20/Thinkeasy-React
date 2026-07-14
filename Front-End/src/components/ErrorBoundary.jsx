import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ThinkEasy render error:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 24, textAlign: 'center', background: 'var(--bg, #fff)',
      }}
      >
        <div style={{ fontSize: 46, marginBottom: 8 }}>⚠️</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text, #1a2744)', marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--muted, #64748b)', maxWidth: 420, marginBottom: 20 }}>
          This page hit an unexpected error. Your data is safe — try reloading, or head back to the homepage.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', background: 'transparent', color: 'var(--text, #1a2744)', fontWeight: 600, cursor: 'pointer', fontSize: 13.5 }}
          >
            Reload page
          </button>
          <button
            onClick={this.handleReset}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#2563eb)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13.5 }}
          >
            Go to Homepage
          </button>
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre style={{ marginTop: 24, maxWidth: 640, textAlign: 'left', fontSize: 11, color: '#ef4444', background: 'rgba(239,68,68,.06)', padding: 12, borderRadius: 8, overflow: 'auto' }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        )}
      </div>
    );
  }
}
