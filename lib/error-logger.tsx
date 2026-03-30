// ============================================
// GLOBAL ERROR LOGGER
// Universal error tracking system
// Can be connected to any external service (Sentry, LogRocket, etc.)
// ============================================

'use client';

import React, { useCallback, useEffect, useRef, Component, ReactNode, ReactElement } from 'react';

// ============================================
// TYPES
// ============================================

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export type ErrorCategory = 
  | 'auth' 
  | 'api' 
  | 'database' 
  | 'validation' 
  | 'network' 
  | 'ui' 
  | 'performance'
  | 'security'
  | 'unknown';

export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  context?: {
    component?: string;
    action?: string;
    previousValue?: unknown;
    expectedValue?: unknown;
  };
}

export interface ErrorLoggerConfig {
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  maxQueueSize?: number;
  flushInterval?: number;
  environment?: string;
  release?: string;
  sampleRate?: number;
}

type ErrorHandler = (entry: ErrorLogEntry) => void | Promise<void>;

// ============================================
// UTILITIES
// ============================================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================
// IN-MEMORY ERROR QUEUE
// ============================================

class ErrorQueue {
  private queue: ErrorLogEntry[] = [];
  private maxSize: number;
  private flushInterval: number;
  private handlers: ErrorHandler[] = [];
  private flushTimer?: ReturnType<typeof setInterval> | undefined;

  constructor(maxSize = 100, flushInterval = 5000) {
    this.maxSize = maxSize;
    this.flushInterval = flushInterval;
    this.startAutoFlush();
  }

  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  async add(entry: ErrorLogEntry): Promise<void> {
    this.queue.push(entry);

    if (this.queue.length >= this.maxSize) {
      await this.flush();
    }
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const entriesToSend = [...this.queue];
    this.queue = [];

    await Promise.all(
      entriesToSend.map(entry => 
        Promise.all(
          this.handlers.map(handler => handler(entry))
        )
      )
    );
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// ============================================
// MAIN ERROR LOGGER CLASS
// ============================================

class GlobalErrorLogger {
  private static instance: GlobalErrorLogger;
  private queue: ErrorQueue;
  private config: ErrorLoggerConfig;
  private sessionId: string;
  private userId?: string;

  private constructor() {
    this.sessionId = generateUUID();
    this.config = {
      enableConsole: true,
      enableRemote: false,
      maxQueueSize: 100,
      flushInterval: 5000,
      environment: process?.env?.NODE_ENV || 'development',
      release: process?.env?.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      sampleRate: 1.0
    };

    this.queue = new ErrorQueue(this.config.maxQueueSize, this.config.flushInterval);
    this.setupHandlers();
  }

  static getInstance(): GlobalErrorLogger {
    if (!GlobalErrorLogger.instance) {
      GlobalErrorLogger.instance = new GlobalErrorLogger();
    }
    return GlobalErrorLogger.instance;
  }

  configure(config: Partial<ErrorLoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.queue.destroy();
    this.queue = new ErrorQueue(this.config.maxQueueSize, this.config.flushInterval);
    this.setupHandlers();
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  clearUser(): void {
    this.userId = undefined;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private setupHandlers(): void {
    if (this.config.enableConsole) {
      this.queue.addHandler(async (entry) => {
        const logMessage = `[${entry.severity.toUpperCase()}] ${entry.category}: ${entry.message}`;
        
        switch (entry.severity) {
          case 'critical':
          case 'error':
            console.error(logMessage, entry);
            break;
          case 'warning':
            console.warn(logMessage, entry);
            break;
          default:
            console.log(logMessage, entry);
        }
      });
    }

    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.queue.addHandler(async (entry) => {
        try {
          await fetch(this.config.remoteEndpoint!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
            keepalive: true
          });
        } catch (error) {
          console.error('Failed to send error to remote:', error);
        }
      });
    }
  }

  private createEntry(
    severity: ErrorSeverity,
    category: ErrorCategory,
    message: string,
    options?: {
      stack?: string;
      metadata?: Record<string, unknown>;
      context?: ErrorLogEntry['context'];
    }
  ): ErrorLogEntry {
    return {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      severity,
      category,
      message,
      stack: options?.stack,
      userId: this.userId,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      metadata: {
        ...options?.metadata,
        environment: this.config.environment,
        release: this.config.release
      },
      context: options?.context
    };
  }

  debug(category: ErrorCategory, message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', category, message, { metadata });
    this.queue.add(entry);
  }

  info(category: ErrorCategory, message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('info', category, message, { metadata });
    this.queue.add(entry);
  }

  warn(category: ErrorCategory, message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createEntry('warning', category, message, { metadata });
    this.queue.add(entry);
  }

  error(
    category: ErrorCategory, 
    message: string, 
    error?: Error,
    context?: ErrorLogEntry['context']
  ): void {
    const entry = this.createEntry('error', category, message, {
      stack: error?.stack,
      context
    });
    this.queue.add(entry);
  }

  critical(
    category: ErrorCategory, 
    message: string, 
    error?: Error,
    context?: ErrorLogEntry['context']
  ): void {
    const entry = this.createEntry('critical', category, message, {
      stack: error?.stack,
      context
    });
    this.queue.add(entry);
  }

  logApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error?: Error,
    requestBody?: unknown,
    responseBody?: unknown
  ): void {
    const severity = statusCode >= 500 ? 'critical' : statusCode >= 400 ? 'error' : 'warning';
    
    this.createEntry(severity, 'api', `API Error: ${method} ${endpoint}`, {
      stack: error?.stack,
      metadata: { endpoint, method, statusCode, requestBody, responseBody }
    });
  }

  logValidationError(
    field: string,
    message: string,
    value?: unknown,
    expected?: unknown
  ): void {
    this.createEntry('warning', 'validation', `Validation Error: ${field}`, {
      context: { component: 'FormValidation', action: field, previousValue: value, expectedValue: expected }
    });
  }

  logPerformance(metric: string, duration: number, threshold: number, metadata?: Record<string, unknown>): void {
    const severity = duration > threshold * 2 ? 'error' : duration > threshold ? 'warning' : 'info';
    this.createEntry(severity, 'performance', `Performance: ${metric}`, {
      metadata: { ...metadata, duration, threshold, exceeded: duration > threshold }
    });
  }

  async flush(): Promise<void> {
    await this.queue.flush();
  }

  destroy(): void {
    this.queue.destroy();
  }
}

// ============================================
// REACT HOOK FOR ERROR LOGGING
// ============================================

export function useErrorLogger() {
  const loggerRef = useRef(GlobalErrorLogger.getInstance());

  useEffect(() => {
    const logger = loggerRef.current;

    const handleError = (event: ErrorEvent) => {
      logger.error('unknown', 'Uncaught error', event.error, {
        component: 'window.onerror',
        action: event.filename
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('unknown', 'Unhandled promise rejection', event.reason, {
        component: 'unhandledrejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const logError = useCallback(<T = unknown>(
    category: ErrorCategory,
    message: string,
    error?: Error,
    context?: ErrorLogEntry['context']
  ): T | undefined => {
    loggerRef.current.error(category, message, error, context);
    return undefined;
  }, []);

  const logApiError = useCallback((
    endpoint: string,
    method: string,
    statusCode: number,
    error?: Error,
    requestBody?: unknown,
    responseBody?: unknown
  ) => {
    loggerRef.current.logApiError(endpoint, method, statusCode, error, requestBody, responseBody);
  }, []);

  const logValidationError = useCallback((
    field: string,
    message: string,
    value?: unknown,
    expected?: unknown
  ) => {
    loggerRef.current.logValidationError(field, message, value, expected);
  }, []);

  const logPerformance = useCallback((
    metric: string,
    duration: number,
    threshold: number,
    metadata?: Record<string, unknown>
  ) => {
    loggerRef.current.logPerformance(metric, duration, threshold, metadata);
  }, []);

  return {
    logger: loggerRef.current,
    logError,
    logApiError,
    logValidationError,
    logPerformance
  };
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  logger?: GlobalErrorLogger;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private logger: GlobalErrorLogger;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.logger = props.logger || GlobalErrorLogger.getInstance();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.logger.critical('ui', `React Error: ${error.message}`, error, {
      component: errorInfo.componentStack || 'unknown'
    });
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          color: '#d32f2f',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          margin: '1rem'
        }}>
          <h2>Algo salio mal</h2>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// HOC FOR ERROR BOUNDARY
// ============================================

interface WithErrorBoundaryOptions {
  logger?: GlobalErrorLogger;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.ComponentType<P> {
  const { logger = GlobalErrorLogger.getInstance(), fallback, onError } = options;

  return function WithErrorBoundary(props: P): ReactElement {
    return (
      <ErrorBoundary logger={logger} fallback={fallback} onError={onError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// ============================================
// EXPORTS
// ============================================

export const errorLogger = GlobalErrorLogger.getInstance();

export default errorLogger;
