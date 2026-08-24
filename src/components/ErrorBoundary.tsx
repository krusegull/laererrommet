"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReportError } from "@/components/ReportError";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Ufanget feil fanget av ErrorBoundary:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertTriangle size={26} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Noe gikk galt</h2>
            <p className="mt-1 max-w-sm text-sm text-foreground/60">
              Det oppstod en uventet feil. Du kan prøve på nytt, eller rapportere problemet så vi
              kan se på det.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={this.handleReset}>Prøv igjen</Button>
            <ReportError error={this.state.errorMessage ?? undefined} />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
