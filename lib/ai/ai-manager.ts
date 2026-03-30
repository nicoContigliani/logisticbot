// ============================================
// AI Manager - Strategy Pattern with Auto-Fallback
// High performance, handles provider failures automatically
// ============================================

import { Message, AIMessage, ProviderHealth, ProviderType, DEFAULT_MODELS } from './types';
import { GroqProvider } from './providers/groq-provider';
import { DeepSeekProvider } from './providers/deepseek-provider';
import { OpenAIProvider } from './providers/openai-provider';
import { AnthropicProvider } from './providers/anthropic-provider';

export interface AIManagerConfig {
  groqApiKey?: string;
  deepseekApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  defaultTemperature?: number;
  defaultMaxTokens?: number;
  enableCache?: boolean;
  cacheTTL?: number; // in seconds
}

interface CacheEntry {
  content: string;
  timestamp: number;
}

class AICache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number;

  constructor(ttl: number = 300) { // 5 minutes default
    this.ttl = ttl * 1000;
  }

  private generateKey(messages: Message[], options?: any): string {
    const key = JSON.stringify({ messages, options });
    // Simple hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  get(messages: Message[], options?: any): string | null {
    const key = this.generateKey(messages, options);
    const entry = this.cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry.content;
    }
    
    this.cache.delete(key);
    return null;
  }

  set(messages: Message[], options: any, content: string): void {
    const key = this.generateKey(messages, options);
    this.cache.set(key, { content, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export class AIManager {
  private providers: Map<ProviderType, any> = new Map();
  private providerOrder: ProviderType[] = [];
  private healthStatus: Map<ProviderType, ProviderHealth> = new Map();
  private cache: AICache;
  private isInitialized = false;
  
  // Performance metrics
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    providerUsage: {} as Record<ProviderType, number>,
  };

  constructor(config: AIManagerConfig) {
    this.cache = new AICache(config.cacheTTL || 300);
    
    // Initialize providers if API keys are provided
    if (config.groqApiKey && config.groqApiKey !== 'xxx') {
      this.providers.set('groq', new GroqProvider(config.groqApiKey));
    }
    if (config.deepseekApiKey && config.deepseekApiKey !== 'xxx') {
      this.providers.set('deepseek', new DeepSeekProvider(config.deepseekApiKey));
    }
    if (config.openaiApiKey && config.openaiApiKey !== 'xxx') {
      this.providers.set('openai', new OpenAIProvider(config.openaiApiKey));
    }
    if (config.anthropicApiKey && config.anthropicApiKey !== 'xxx') {
      this.providers.set('anthropic', new AnthropicProvider(config.anthropicApiKey));
    }

    // Set provider order by priority
    this.providerOrder = ['groq', 'deepseek', 'openai', 'anthropic'].filter(
      p => this.providers.has(p as ProviderType)
    ) as ProviderType[];

    this.isInitialized = this.providerOrder.length > 0;
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Send a chat message with automatic fallback
   * If one provider fails, it automatically tries the next one
   */
  async chat(
    messages: Message[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
    }
  ): Promise<AIMessage> {
    if (!this.isInitialized) {
      throw new Error('AI Manager not initialized. No valid API keys provided.');
    }

    this.metrics.totalRequests++;

    // Check cache first
    if (options?.useCache !== false) {
      const cached = this.cache.get(messages, options);
      if (cached) {
        return {
          role: 'assistant',
          content: cached,
          provider: 'cache',
        };
      }
    }

    // Try each provider in order until one succeeds
    let lastError: Error | null = null;
    
    for (const providerType of this.providerOrder) {
      const provider = this.providers.get(providerType);
      
      try {
        const result = await provider.sendMessage(messages, {
          model: options?.model,
          temperature: options?.temperature ?? 0.7,
          maxTokens: options?.maxTokens ?? 2048,
        });

        // Update metrics
        this.metrics.successfulRequests++;
        this.metrics.providerUsage[providerType] = (this.metrics.providerUsage[providerType] || 0) + 1;

        // Cache successful response
        if (options?.useCache !== false) {
          this.cache.set(messages, options, result.content);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[AI Manager] ${providerType} failed:`, error);
        
        // Mark provider as unhealthy temporarily
        this.healthStatus.set(providerType, {
          name: providerType,
          isHealthy: false,
          error: (error as Error).message,
          lastCheck: new Date(),
        });
      }
    }

    // All providers failed
    this.metrics.failedRequests++;
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Check health of all providers
   */
  async checkHealth(): Promise<Map<ProviderType, ProviderHealth>> {
    for (const [type, provider] of this.providers) {
      try {
        const isHealthy = await provider.healthCheck();
        this.healthStatus.set(type, {
          name: type,
          isHealthy,
          lastCheck: new Date(),
        });
      } catch (error) {
        this.healthStatus.set(type, {
          name: type,
          isHealthy: false,
          error: (error as Error).message,
          lastCheck: new Date(),
        });
      }
    }
    return this.healthStatus;
  }

  /**
   * Get current provider status
   */
  getStatus(): {
    initialized: boolean;
    availableProviders: ProviderType[];
    health: Record<ProviderType, ProviderHealth>;
    metrics: {
      totalRequests: number;
      successfulRequests: number;
      failedRequests: number;
      providerUsage: Record<ProviderType, number>;
    };
  } {
    return {
      initialized: this.isInitialized,
      availableProviders: this.providerOrder,
      health: Object.fromEntries(this.healthStatus) as Record<ProviderType, ProviderHealth>,
      metrics: { ...this.metrics },
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Force use a specific provider (bypass fallback)
   */
  async chatWithProvider(
    providerType: ProviderType,
    messages: Message[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIMessage> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      throw new Error(`Provider ${providerType} not available`);
    }

    this.metrics.totalRequests++;
    this.metrics.providerUsage[providerType] = (this.metrics.providerUsage[providerType] || 0) + 1;

    try {
      const result = await provider.sendMessage(messages, options);
      this.metrics.successfulRequests++;
      return result;
    } catch (error) {
      this.metrics.failedRequests++;
      throw error;
    }
  }
}

// ============================================
// Singleton Instance
// ============================================

let aiManagerInstance: AIManager | null = null;

export function getAIManager(): AIManager {
  if (!aiManagerInstance) {
    aiManagerInstance = new AIManager({
      groqApiKey: process.env.GROQ_API_KEY,
      deepseekApiKey: process.env.DEEPSEEK_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      defaultTemperature: 0.7,
      defaultMaxTokens: 2048,
      enableCache: true,
      cacheTTL: 300,
    });
  }
  return aiManagerInstance;
}

export function createAIManager(config: AIManagerConfig): AIManager {
  return new AIManager(config);
}