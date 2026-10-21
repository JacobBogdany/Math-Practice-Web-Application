import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env?.DEV) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <section
          className="error-boundary"
          role="alert"
          aria-labelledby="error-boundary-title"
        >
          <div className="error-boundary__card">
            <span className="error-boundary__icon" aria-hidden="true">
              ✨
            </span>
            <h1 id="error-boundary-title" className="error-boundary__title">
              Something unexpected happened
            </h1>
            <p className="error-boundary__message">
              Don't worry! Your math progress and practice history are safe on
              this device. Let's get you back on track.
            </p>
            <div className="error-boundary__actions">
              <Button variant="sky" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="sun" onClick={this.handleGoHome}>
                Go to Home Page
              </Button>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
