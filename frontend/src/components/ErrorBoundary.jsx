import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="card max-w-sm p-8 text-center">
            <p className="page-heading text-lg">Something went wrong</p>
            <p className="mt-2 text-sm text-slate-500">{this.state.message}</p>
            <button type="button" onClick={() => window.location.reload()} className="btn-submit mt-6">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
