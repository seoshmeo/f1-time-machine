import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '48px 24px',
        }}>
          <div style={{
            backgroundColor: '#1A1A2E',
            border: '1px solid #2A2A3E',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '600px',
            textAlign: 'center',
          }}>
            <h2 style={{
              color: '#E10600',
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '16px',
            }}>
              Something went wrong
            </h2>
            <p style={{
              color: '#B0B0B0',
              fontSize: '14px',
              marginBottom: '24px',
            }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#E10600',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
