import React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050B16] text-[#FFFFFF] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-[#0E1726] border-2 border-[#EF4444] rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#FFFFFF]">Application Encountered an Error</h2>
                <p className="text-sm text-[#CBD5E1] mt-1">
                  An unexpected runtime error occurred while rendering the portal.
                </p>
              </div>
            </div>

            <div className="bg-[#162032] border border-[#94A3B8]/30 rounded-xl p-4 font-mono text-xs text-[#FCA5A5] overflow-x-auto">
              {this.state.error?.message || 'Unknown Error'}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00F2FE] hover:bg-[#38BDF8] text-[#050B16] font-bold text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#162032] hover:bg-[#334155] text-[#FFFFFF] border border-[#94A3B8] font-semibold text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Local Cache &amp; Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
