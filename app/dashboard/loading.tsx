'use client';

export default function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 0,
            background: '#0078d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <span style={{ fontSize: 40, color: 'white' }}>🚚</span>
        </div>

        <h2 style={{ marginBottom: 16, fontWeight: 300, color: '#333', fontSize: '24px' }}>
          LogisticBot
        </h2>

        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid #e0e0e0',
            borderTopColor: '#0078d4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px auto',
          }}
        />

        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          Loading dashboard...
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
