// Global configuration for LogisticBot
// This file should be imported across the project

export const config = {
  // Frontend Domain (Next.js)
  frontend: {
    domain: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || 'http://localhost:3000',
    name: 'LogisticBot',
  },
  
  // Backend Domain (Deno)
  backend: {
    domain: process.env.NEXT_PUBLIC_BACKEND_DOMAIN || 'http://localhost:8000',
    name: 'LogisticBot API',
  },
  
  // Bot Configuration
  bot: {
    whatsapp: {
      name: 'WhatsApp Bot',
      checkInterval: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
    },
    email: {
      name: 'Email Bot',
      checkInterval: 5000,
      timeout: 10000,
    },
  },
  
  // API Endpoints
  api: {
    broadcasts: '/api/broadcasts',
    connection: '/api/bot/connection',
    logistics: '/api/logistics',
    files: '/api/files/upload',
  },
  
  // Timeouts
  timeouts: {
    api: 30000, // 30 seconds
    polling: 5000, // 5 seconds
    reconnect: 10000, // 10 seconds
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.backend.domain}${endpoint}`;
};

// Helper function to get frontend URL
export const getFrontendUrl = (path: string = ''): string => {
  return `${config.frontend.domain}${path}`;
};

export default config;
