import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      errorMessage: error?.message || 'An unexpected rendering error occurred' 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border-2 border-rose-200 shadow-xl text-center space-y-5">
          <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Application View Restored</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We detected a temporary display glitch while rendering the active view. Click below to safely reload and continue your practice seamlessly.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-rose-600/80 bg-rose-50 p-2 rounded-xl border border-rose-100 max-w-xs mx-auto truncate">
                {this.state.errorMessage}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: undefined })}
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry View
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Home className="h-3.5 w-3.5" /> Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}




