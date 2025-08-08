import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service
      console.error('Production error:', { error, errorInfo });
    }
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="max-w-md w-full">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-xl shadow-red-500/10 p-8 text-center">
              <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-6 border border-red-500/30">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-300 mb-6">
                We're sorry, but something unexpected happened. Please try one of the options below.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-300 bg-red-900/20 p-3 rounded border border-red-500/30 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg shadow-primary-500/25"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;