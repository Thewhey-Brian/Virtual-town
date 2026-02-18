'use client';

import { ReactNode, useState, useEffect, Component, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for catching React component errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({ 
  error, 
  onReset 
}: { 
  error: Error | null; 
  onReset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">出错了</h2>
        <p className="text-gray-600 mb-6">
          应用程序遇到了意外错误。请刷新页面或返回首页。
        </p>

        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#e59a3d] hover:bg-[#d4862a] text-white rounded-full font-medium transition-colors"
          >
            刷新页面
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors"
          >
            返回首页
          </button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          {showDetails ? '隐藏' : '显示'} 错误详情
        </button>

        {showDetails && error && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-600 break-all">{error.message}</p>
            {process.env.NODE_ENV === 'development' && error.stack && (
              <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Section-level error boundary with recovery
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName = 'section',
  onRetry 
}: { 
  children: ReactNode; 
  sectionName?: string;
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-red-800">无法加载{sectionName}</h3>
          </div>
          <p className="text-sm text-red-600 mb-4">
            加载此部分内容时出现问题。
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              重试
            </button>
          )}
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Async error boundary hook for data fetching
 */
export function useAsyncError() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
