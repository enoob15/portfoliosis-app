import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIModelProvider, AIModelResponse } from './types';

export class GoogleProvider implements AIModelProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<AIModelResponse> {
    const model = this.genAI.getGenerativeModel({ 
      model: this.model,
      systemInstruction: systemPrompt 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      // Google's SDK usage reporting is slightly different, leaving as optional for now
      model: this.model,
    };
  }
}
