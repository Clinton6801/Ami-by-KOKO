"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultError onRetry={() => this.setState({ hasError: false, message: "" })} />;
    }
    return this.props.children;
  }
}

function DefaultError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center gap-5">
      {/* Sad Kòkò */}
      <div className="text-7xl">🦜</div>
      <div>
        <h2 className="text-xl font-extrabold text-stone-800 mb-1">
          Oops! Something went wrong
        </h2>
        <p className="text-stone-500 text-sm max-w-xs mx-auto leading-relaxed">
          Kòkò couldn&apos;t load this page. Check your connection and try again.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-amber-200"
        >
          🔄 Try again
        </button>
        <button
          onClick={() => window.location.href = "/home"}
          className="w-full bg-white text-stone-600 font-semibold py-3 rounded-2xl transition ring-1 ring-stone-200 hover:bg-stone-50"
        >
          🏠 Go home
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
