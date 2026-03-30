'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Box, CircularProgress, Typography } from '@/components/metro';

export default function SwaggerDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <CircularProgress />
        <Typography>Loading API Documentation...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Typography color="#d32f2f">Error loading API docs: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box style={{ width: '100%', minHeight: '100vh' }}>
      <SwaggerUI spec={spec} />
    </Box>
  );
}
