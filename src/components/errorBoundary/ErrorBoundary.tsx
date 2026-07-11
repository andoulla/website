import { Component } from 'react';

import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error('ErrorBoundary caught an error:', error.message, error.stack);
  }

  render() {
    if (this.state.error !== null) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}
