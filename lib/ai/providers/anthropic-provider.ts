// ============================================
// Anthropic AI Provider (Claude)
// High quality - Last resort fallback
// ============================================

import { BaseAIProvider, Message, AIMessage, DEFAULT_MODELS, PROVIDER_PRIORITIES } from '../types';

export class AnthropicProvider extends BaseAIProvider {
  name = 'anthropic';
  priority = PROVIDER_PRIORITIES.anthropic;
  baseUrl = 'https://api.anthropic.com/v1';
  defaultModel = DEFAULT_MODELS.anthropic;
  apiKey: string;
  timeout = 35000; // Slightly longer timeout

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

    // Anthropic uses a different format - need to convert messages
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    // Add system prompt if present
    const systemPrompt = messages.find(m => m.role === 'system')?.content;

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          messages: anthropicMessages,
          system: systemPrompt,
          temperature,
          max_tokens: maxTokens,
        }),
      },
      3
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Anthropic error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      role: 'assistant',
      content: data.content[0]?.text || '',
      model: data.model,
      provider: this.name,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      } : undefined,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, so we just check if we can connect
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
        signal: AbortSignal.timeout(5000),
      });
      // 400 is expected for ping, but means connection works
      return response.status === 400 || response.ok;
    } catch {
      return false;
    }
  }
}