// Swagger/OpenAPI Configuration
// This file provides static OpenAPI definitions

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EyTeacher API',
    version: '1.0.0',
    description: 'Educational Platform API Documentation',
    contact: {
      name: 'API Support',
      email: 'support@eyteacher.com',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      clerkAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: 'Clerk JWT token',
      },
    },
  },
};

export default swaggerSpec;
