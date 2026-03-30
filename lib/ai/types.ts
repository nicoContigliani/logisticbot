// ============================================
// AI Provider Types & Interfaces
// ============================================

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIMessage {
  role: 'assistant';
  content: string;
  model?: string;
  provider?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  maxTokens?: number;
  defaultModel?: string;
}

export interface ProviderHealth {
  name: string;
  isHealthy: boolean;
  latency?: number;
  lastCheck?: Date;
  error?: string;
}

// ============================================
// Base Provider Interface (Strategy Pattern)
// ============================================

export abstract class BaseAIProvider {
  abstract name: string;
  abstract priority: number;
  abstract baseUrl: string;
  abstract defaultModel: string;
  abstract apiKey: string;
  timeout = 30000; // Default 30s timeout
  
  abstract sendMessage(messages: Message[], options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIMessage>;
  
  abstract healthCheck(): Promise<boolean>;
  
  protected async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(this.timeout),
        });
        
        if (!response.ok && response.status !== 429) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  }
}

// ============================================
// AI Provider Factory
// ============================================

export type ProviderType = 'groq' | 'deepseek' | 'openai' | 'anthropic';

export interface ProviderConfig {
  type: ProviderType;
  apiKey: string;
  enabled: boolean;
  priority: number;
  defaultModel: string;
}

export const DEFAULT_MODELS: Record<ProviderType, string> = {
  groq: 'llama-3.3-70b-versatile',
  deepseek: 'deepseek-chat',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022',
};

export const PROVIDER_PRIORITIES: Record<ProviderType, number> = {
  groq: 1,      // Más rápido
  deepseek: 2,  // Barato
  openai: 3,    // Confiable
  anthropic: 4, // Alta calidad
};