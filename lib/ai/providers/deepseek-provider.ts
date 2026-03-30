// ============================================
// DeepSeek AI Provider
// Cheap, good quality - Secondary provider
// ============================================

import { BaseAIProvider, Message, AIMessage, DEFAULT_MODELS, PROVIDER_PRIORITIES } from '../types';

export class DeepSeekProvider extends BaseAIProvider {
  name = 'deepseek';
  priority = PROVIDER_PRIORITIES.deepseek;
  baseUrl = 'https://api.deepseek.com/v1';
  defaultModel = DEFAULT_MODELS.deepseek;
  apiKey: string;
  timeout = 30000;

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
      throw new Error(error.message || `DeepSeek error: ${response.status}`);
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
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}