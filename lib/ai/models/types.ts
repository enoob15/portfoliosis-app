export interface AIModelResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface AIModelProvider {
  generateText(prompt: string, systemPrompt?: string): Promise<AIModelResponse>;
}
