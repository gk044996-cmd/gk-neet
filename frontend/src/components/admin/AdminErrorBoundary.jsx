import React from 'react';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin UI Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-white dark:bg-[#151821] rounded-2xl border border-red-200 dark:border-red-900 shadow-xl max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 text-4xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Something went wrong</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium">
            The admin panel encountered an unexpected error. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Refresh Page
          </button>
          <div className="mt-8 p-4 bg-slate-50 dark:bg-black/50 rounded-xl text-left w-full overflow-auto text-xs text-red-500 font-mono">
            {this.state.error && this.state.error.toString()}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AdminErrorBoundary;
