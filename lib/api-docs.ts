// ==================== DYNAMIC API DOCUMENTATION ====================
// This module automatically generates OpenAPI specs from your routes and interfaces

import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

// ==================== TYPES ====================

interface RouteInfo {
  path: string;
  method: string;
  handler: string;
  description?: string;
  tags?: string[];
}

interface InterfaceInfo {
  name: string;
  properties: PropertyInfo[];
}

interface PropertyInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

// ==================== API ROUTES AUTO-DISCOVERY ====================

/**
 * Auto-discovers API routes from the app directory
 */
export function discoverApiRoutes(): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const apiDir = path.join(process.cwd(), 'app', 'api');

  if (!fs.existsSync(apiDir)) {
    return routes;
  }

  function scanDirectory(dir: string, basePath: string = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const routePath = file === 'api' ? '' : file;
        scanDirectory(fullPath, `${basePath}/${routePath}`);
      } else if (file === 'route.ts') {
        // Found an API route file
        const routePath = basePath.replace(/^\/api/, '') || '/';
        const method = detectMethod(fullPath);
        const handler = extractHandlerInfo(fullPath);
        
        routes.push({
          path: routePath,
          method: method.toUpperCase(),
          handler: handler.name,
          description: handler.description,
          tags: extractTags(basePath),
        });
      }
    }
  }

  scanDirectory(apiDir);
  return routes;
}

function detectMethod(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('POST')) return 'post';
  if (content.includes('PUT')) return 'put';
  if (content.includes('PATCH')) return 'patch';
  if (content.includes('DELETE')) return 'delete';
  return 'get';
}

function extractHandlerInfo(filePath: string): { name: string; description: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract function name
  const funcMatch = content.match(/export\s+async\s+function\s+(\w+)/);
  const name = funcMatch ? funcMatch[1] : 'handler';

  // Extract JSDoc description
  const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
  const description = jsdocMatch ? jsdocMatch[1] : '';

  return { name, description };
}

function extractTags(basePath: string): string[] {
  const segments = basePath.split('/').filter(Boolean);
  if (segments.length > 1 && segments[0] === 'api') {
    return [segments[1] || 'General'];
  }
  return ['General'];
}

// ==================== INTERFACES AUTO-DISCOVERY ====================

/**
 * Discovers TypeScript interfaces from a directory
 */
export function discoverInterfaces(dirPath: string = 'lib'): InterfaceInfo[] {
  const interfaces: InterfaceInfo[] = [];
  const targetDir = path.join(process.cwd(), dirPath);

  if (!fs.existsSync(targetDir)) {
    return interfaces;
  }

  function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Match interface definitions
    const interfaceRegex = /interface\s+(\w+)\s*\{([^}]+)\}/g;
    let match;
    
    while ((match = interfaceRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      
      const properties: PropertyInfo[] = [];
      const propRegex = /(\w+)(\?)?:\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propRegex.exec(body)) !== null) {
        properties.push({
          name: propMatch[1],
          required: !propMatch[2],
          type: propMatch[3].trim(),
        });
      }
      
      interfaces.push({ name, properties });
    }

    // Match type definitions
    const typeRegex = /type\s+(\w+)\s*=\s*\{([^}]+)\}/g;
    while ((match = typeRegex.exec(content)) !== null) {
      const name = match[1];
      const body = match[2];
      
      const properties: PropertyInfo[] = [];
      const propRegex = /(\w+)(\?)?:\s*([^;]+);/g;
      let propMatch;
      
      while ((propMatch = propRegex.exec(body)) !== null) {
        properties.push({
          name: propMatch[1],
          required: !propMatch[2],
          type: propMatch[3].trim(),
        });
      }
      
      interfaces.push({ name, properties });
    }
  }

  function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        scanFile(fullPath);
      }
    }
  }

  scanDirectory(targetDir);
  return interfaces;
}

// ==================== OPENAPI GENERATOR ====================

/**
 * Generates complete OpenAPI specification dynamically
 */
export function generateOpenApiSpec() {
  const routes = discoverApiRoutes();
  const interfaces = discoverInterfaces('lib');
  const interfacesModels = discoverInterfaces('models');

  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'EyTeacher API',
      version: '1.0.0',
      description: generateDescription(routes),
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
    paths: generatePaths(routes),
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
      schemas: generateSchemas([...interfaces, ...interfacesModels]),
    },
    tags: generateTags(routes),
  };

  return spec;
}

function generateDescription(routes: RouteInfo[]): string {
  const categories = [...new Set(routes.map(r => r.tags?.[0] || 'General'))];
  return `EyTeacher Educational Platform API\n\nAvailable endpoints:\n${categories.map(c => `- ${c}`).join('\n')}`;
}

function generatePaths(routes: RouteInfo[]): Record<string, any> {
  const paths: Record<string, any> = {};

  for (const route of routes) {
    if (!paths[route.path]) {
      paths[route.path] = {};
    }

    paths[route.path][route.method.toLowerCase()] = {
      summary: route.handler,
      description: route.description || `${route.method} operation for ${route.path}`,
      tags: route.tags || ['General'],
      responses: {
        200: {
          description: 'Successful response',
        },
        400: {
          description: 'Bad request',
        },
        401: {
          description: 'Unauthorized',
        },
        500: {
          description: 'Internal server error',
        },
      },
    };
  }

  return paths;
}

function generateSchemas(interfaces: InterfaceInfo[]): Record<string, any> {
  const schemas: Record<string, any> = {
    Error: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
    Success: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
        message: { type: 'string' },
      },
    },
  };

  for (const iface of interfaces) {
    schemas[iface.name] = {
      type: 'object',
      properties: {},
      required: [],
    };

    for (const prop of iface.properties) {
      schemas[iface.name].properties[prop.name] = {
        type: mapTypeToOpenApi(prop.type),
        description: prop.description,
      };

      if (prop.required) {
        schemas[iface.name].required.push(prop.name);
      }
    }
  }

  return schemas;
}

function mapTypeToOpenApi(tsType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    Date: 'string',
    ObjectId: 'string',
    'Record<string, any>': 'object',
  };

  // Handle arrays
  if (tsType.includes('[]')) {
    return 'array';
  }

  // Handle optional types
  const cleanType = tsType.replace(' | undefined', '').replace(' | null', '').trim();

  return typeMap[cleanType] || 'string';
}

function generateTags(routes: RouteInfo[]): Array<{ name: string; description: string }> {
  const tagMap = new Map<string, string>();

  for (const route of routes) {
    const tag = route.tags?.[0] || 'General';
    if (!tagMap.has(tag)) {
      tagMap.set(tag, `${tag} related endpoints`);
    }
  }

  return Array.from(tagMap.entries()).map(([name, description]) => ({
    name,
    description,
  }));
}

// ==================== EXPORTS ====================

export const autoSpec = generateOpenApiSpec();
export default autoSpec;
