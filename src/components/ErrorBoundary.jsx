import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-4 my-4 p-6 neu-card text-center">
          <div className="w-12 h-12 mx-auto mb-4 neu-raised rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#1a1a2e] mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-[#718096] mb-4">
            Failed to load content. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="btn-neu-primary"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
