import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white font-poppins text-[#1A1A1A]">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-fadeIn">
            <div className="flex justify-center">
              <img
                src="/assets/images/logo.png"
                alt="UdaanHer Logo"
                className="h-14 w-auto object-contain mix-blend-multiply"
              />
            </div>

            <div className="w-14 h-14 rounded-full bg-red-50 text-[#EA3C36] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                Something Went Wrong
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                An unexpected issue occurred while rendering this page. Our team has been alerted. You can reload or return to safety.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-left overflow-x-auto text-[11px] font-mono text-gray-700 max-h-32">
                <span className="font-bold text-[#EA3C36]">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#EA3C36] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-bold shadow-md hover-lift transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold border border-gray-200 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-gray-600" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

