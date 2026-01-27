import Anthropic from '@anthropic-ai/sdk';
import { AIModelProvider, AIModelResponse } from './types';

export class AnthropicProvider implements AIModelProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-haiku-20240307') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIModelResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      return {
        content,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        model: this.model,
      };
    } catch (error: any) {
      console.error('[Anthropic Provider] Error:', {
        message: error.message,
        status: error.status,
        type: error.type
      });
      throw new Error(`Anthropic API error: ${error.message || 'Unknown error'}`);
    }
  }
}
