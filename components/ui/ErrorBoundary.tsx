'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@/components/metro';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-paper)',
          }}
          className="bg-blueprint"
        >
          <Container maxWidth="sm" style={{ textAlign: 'center' }}>
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: '16px',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                border: '2px solid #fecaca',
              }}
            >
              <span style={{ fontSize: 40, color: '#dc2626' }}>⚠️</span>
            </Box>

            <Typography
              variant="h5"
              weight={700}
              gutterBottom
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Something went wrong
            </Typography>

            <Typography variant="body1" color="#666" style={{ marginBottom: 32 }}>
              We encountered an unexpected error. Please try refreshing the page.
            </Typography>

            {this.state.error && (
              <Box
                style={{
                  padding: 16,
                  marginBottom: 24,
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  textAlign: 'left',
                }}
              >
                <Typography
                  variant="caption"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={this.handleReset}
              style={{
                backgroundColor: '#0078d4',
                color: 'white',
              }}
            >
              <span style={{ marginRight: 8 }}>🔄</span>
              Try Again
            </Button>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
