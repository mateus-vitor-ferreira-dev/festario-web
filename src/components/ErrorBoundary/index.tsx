/**
 * @module components/ErrorBoundary
 * @description Captura erros de renderização em subárvores React e exibe um fallback
 * em vez de quebrar a aplicação inteira.
 */
import { Component, ErrorInfo, ReactNode } from "react";
import { Sentry } from "../../config/sentry";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        Sentry?.captureException?.(error, {
            extra: { componentStack: info.componentStack },
        });
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? null;
        }
        return this.props.children;
    }
}
