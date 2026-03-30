'use client';

import { Box, Container, Typography } from '@/components/metro';

export default function DashboardLoading() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-paper)',
      }}
      className="bg-blueprint"
    >
      <Container maxWidth="sm" style={{ textAlign: 'center' }}>
        {/* Logo */}
        <Box
          style={{
            width: 80,
            height: 80,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <span style={{ fontSize: 40, color: 'white' }}>🚚</span>
        </Box>

        {/* Loading Text */}
        <Typography
          variant="h5"
          weight={700}
          style={{ marginBottom: 16, fontFamily: 'var(--font-mono)' }}
        >
          LogisticBot
        </Typography>

        {/* Spinner */}
        <Box
          style={{
            width: 48,
            height: 48,
            border: '3px solid',
            borderColor: 'var(--marker-shadow)',
            borderTopColor: 'var(--ink-black)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px auto',
          }}
        />

        <Typography variant="body2" color="var(--ink-black)">
          Loading dashboard...
        </Typography>
      </Container>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </Box>
  );
}
