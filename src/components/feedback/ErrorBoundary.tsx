import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
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

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] Uncaught error:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          data-testid="error-boundary"
          className="min-h-screen flex items-center justify-center p-8"
        >
          <div className="glass rounded-xl p-8 max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-400">
              An unexpected error occurred. Try reloading the page or resetting
              the app data.
            </p>
            {this.state.error && (
              <p
                data-testid="error-boundary-message"
                className="text-xs text-red-400 bg-red-500/10 rounded p-3 font-mono text-left break-all"
              >
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                data-testid="error-boundary-btn-retry"
                onClick={this.handleReset}
                className="btn-ghost"
              >
                Try again
              </button>
              <button
                data-testid="error-boundary-btn-reload"
                onClick={() => window.location.reload()}
                className="btn-neon-purple"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
