import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Catches render-time errors anywhere in the tree so a single component failure shows a friendly
 * fallback instead of a blank white screen.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="text-5xl">😵</div>
          <h1 className="text-xl font-bold text-foreground">Đã có lỗi xảy ra</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Giao diện gặp sự cố ngoài dự kiến. Bạn có thể tải lại trang để tiếp tục.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
