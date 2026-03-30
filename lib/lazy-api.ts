// ============================================
// LAZY LOADING - BACKEND API
// Optimized imports for server-side lazy loading
// ============================================

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// DYNAMIC IMPORTS MAP
// Lazy load heavy modules only when needed
// ============================================

// Map of heavy operations to their handlers
type HandlerMap = Record<string, (req: NextRequest) => Promise<NextResponse>>;

const handlerCache = new Map<string, any>();

// Lazy load a module only when first needed
async function lazyImport<T>(modulePath: string): Promise<T> {
  if (handlerCache.has(modulePath)) {
    return handlerCache.get(modulePath);
  }
  
  const module = await import(modulePath);
  handlerCache.set(modulePath, module);
  return module;
}

// ============================================
// LAZY DATABASE CONNECTION
// Connect to MongoDB only when needed
// ============================================

let dbConnection: any = null;
let isConnecting = false;
let connectionPromise: Promise<any> | null = null;

export async function getLazyDbConnection() {
  // If already connected, return cached connection
  if (dbConnection) {
    return dbConnection;
  }
  
  // If already connecting, wait for the existing promise
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }
  
  // Start new connection
  isConnecting = true;
  connectionPromise = (async () => {
    try {
      const { getDatabase } = await import('./mongodb');
      dbConnection = await getDatabase();
      return dbConnection;
    } finally {
      isConnecting = false;
    }
  })();
  
  return connectionPromise;
}

// ============================================
// LAZY MODEL IMPORTS
// Import models only when needed
// ============================================

const modelCache = new Map<string, any>();

export async function getLazyModel(modelName: string) {
  if (modelCache.has(modelName)) {
    return modelCache.get(modelName);
  }
  
  // Lazy load models only when needed
  const models: Record<string, () => Promise<any>> = {
    Program: () => import('../models/Program').then(m => m.default),
    User: () => import('../models/User').then(m => m.default),
  };
  
  if (!models[modelName]) {
    throw new Error(`Model ${modelName} not found`);
  }
  
  const model = await models[modelName]();
  modelCache.set(modelName, model);
  return model;
}

// ============================================
// PAGINATED QUERY HELPERS
// Server-side pagination with lazy loading
// ============================================

export interface LazyQueryOptions {
  modelName: string;
  query?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  page?: number;
  limit?: number;
  select?: string;
  populate?: string | Record<string, any>;
}

export async function lazyQuery<T>(options: LazyQueryOptions): Promise<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const {
    modelName,
    query = {},
    sort = { createdAt: -1 },
    page = 1,
    limit = 10,
    select,
    populate
  } = options;
  
  const Model = await getLazyModel(modelName);
  const skip = (page - 1) * limit;
  
  // Build query
  let queryBuilder = Model.find(query);
  
  // Apply select
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }
  
  // Apply populate
  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }
  
  // Execute in parallel: data query + count query
  const [data, total] = await Promise.all([
    queryBuilder.sort(sort).skip(skip).limit(limit).lean(),
    Model.countDocuments(query)
  ]);
  
  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
}

// ============================================
// LAZY AGGREGATION
// For complex queries
// ============================================

export async function lazyAggregate<T>(options: {
  modelName: string;
  pipeline: Record<string, any>[];
  page?: number;
  limit?: number;
}): Promise<{ data: T[]; total: number }> {
  const { modelName, pipeline, page = 1, limit = 10 } = options;
  const Model = await getLazyModel(modelName);
  
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    Model.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ]),
    Model.aggregate([
      ...pipeline,
      { $count: 'total' }
    ]).then((result: any[]) => result[0]?.total || 0)
  ]);
  
  return { data: data as T[], total };
}

// ============================================
// CACHE HELPERS
// Simple in-memory cache for API responses
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  // Check if expired
  if (Date.now() - entry.timestamp > entry.ttl) {
    memoryCache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  
  // Delete keys matching pattern
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

// ============================================
// BATCH OPERATIONS
// For bulk operations
// ============================================

export async function lazyBatchInsert<T>(options: {
  modelName: string;
  documents: Omit<T, '_id'>[];
  chunkSize?: number;
}): Promise<{ inserted: number; errors: Error[] }> {
  const { modelName, documents, chunkSize = 100 } = options;
  const Model = await getLazyModel(modelName);
  
  const errors: Error[] = [];
  let inserted = 0;
  
  // Process in chunks
  for (let i = 0; i < documents.length; i += chunkSize) {
    const chunk = documents.slice(i, i + chunkSize);
    
    try {
      const result = await Model.insertMany(chunk, { ordered: false });
      inserted += result.length;
    } catch (error: any) {
      // Collect errors from bulk insert
      if (error.writeErrors) {
        errors.push(...error.writeErrors.map((e: any) => new Error(e.errmsg)));
      } else {
        errors.push(error);
      }
    }
  }
  
  return { inserted, errors };
}

export async function lazyBatchUpdate(options: {
  modelName: string;
  updates: { filter: Record<string, any>; update: Record<string, any> }[];
  chunkSize?: number;
}): Promise<{ updated: number; errors: Error[] }> {
  const { modelName, updates, chunkSize = 100 } = options;
  const Model = await getLazyModel(modelName);
  
  const errors: Error[] = [];
  let updated = 0;
  
  // Process in chunks
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    
    try {
      const promises = chunk.map(({ filter, update }) => 
        Model.updateOne(filter, update)
      );
      const results = await Promise.all(promises);
      updated += results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);
    } catch (error) {
      errors.push(error as Error);
    }
  }
  
  return { updated, errors };
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  getLazyDbConnection,
  getLazyModel,
  lazyQuery,
  lazyAggregate,
  getCached,
  setCached,
  invalidateCache,
  lazyBatchInsert,
  lazyBatchUpdate
};
