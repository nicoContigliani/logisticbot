// ============================================
// AI Module - Main Export
// Usage: import { getAIManager, createAIManager } from '@/lib/ai';
// ============================================

export * from './types';
export * from './ai-manager';
export { GroqProvider } from './providers/groq-provider';
export { DeepSeekProvider } from './providers/deepseek-provider';
export { OpenAIProvider } from './providers/openai-provider';
export { AnthropicProvider } from './providers/anthropic-provider';

// ============================================
// Quick Usage Examples
// ============================================

/**
 * Example 1: Using the singleton instance
 * 
 * import { getAIManager } from '@/lib/ai';
 * 
 * const ai = getAIManager();
 * const response = await ai.chat([
 *   { role: 'system', content: 'You are a helpful tutor.' },
 *   { role: 'user', content: 'Explain photosynthesis' }
 * ]);
 * console.log(response.content);
 */

/**
 * Example 2: Using with custom config
 * 
 * import { createAIManager } from '@/lib/ai';
 * 
 * const ai = createAIManager({
 *   groqApiKey: 'your-groq-key',
 *   deepseekApiKey: 'your-deepseek-key',
 *   openaiApiKey: 'your-openai-key',
 *   enableCache: true,
 *   cacheTTL: 600, // 10 minutes
 * });
 * 
 * const response = await ai.chat(messages, {
 *   temperature: 0.5,
 *   maxTokens: 1000,
 *   useCache: true,
 * });
 */

/**
 * Example 3: Get provider status
 * 
 * const ai = getAIManager();
 * const status = ai.getStatus();
 * console.log(status);
 * // { 
 * //   initialized: true,
 * //   availableProviders: ['groq', 'deepseek'],
 * //   health: { groq: { isHealthy: true }, deepseek: { isHealthy: true } },
 * //   metrics: { totalRequests: 10, successfulRequests: 9, ... }
 * // }
 */

/**
 * Example 4: Force specific provider
 * 
 * const ai = getAIManager();
 * const response = await ai.chatWithProvider('deepseek', messages);
 */