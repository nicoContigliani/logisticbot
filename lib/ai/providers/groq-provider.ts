// ============================================
// Groq AI Provider
// Ultra-fast, low cost - Primary provider
// ============================================

import { BaseAIProvider, Message, AIMessage, DEFAULT_MODELS, PROVIDER_PRIORITIES } from '../types';

export class GroqProvider extends BaseAIProvider {
  name = 'groq';
  priority = PROVIDER_PRIORITIES.groq;
  baseUrl = 'https://api.groq.com/openai/v1';
  defaultModel = DEFAULT_MODELS.groq;
  apiKey: string;
  timeout = 25000; // 25s timeout - very fast

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: Message[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<AIMessage> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2048;

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      },
      3
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Groq error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      role: 'assistant',
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      provider: this.name,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const start = Date.now();
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      
      const latency = Date.now() - start;
      return response.ok;
    } catch {
      return false;
    }
  }
}