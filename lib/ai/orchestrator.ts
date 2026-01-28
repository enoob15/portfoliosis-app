import { OpenAIProvider } from './models/openai';
import { AnthropicProvider } from './models/anthropic';
import { GoogleProvider } from './models/google';
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT, ENHANCEMENT_SYSTEM_PROMPT, ENHANCEMENT_USER_PROMPT } from './prompts';
import { ParsedResume, EnhancedProfile } from '@/types/profile';

export class AIOrchestrator {
  private gpt4: OpenAIProvider | null;
  private claude: AnthropicProvider | null;
  private gemini: GoogleProvider | null;

  constructor(apiKeys: {
    openai: string;
    anthropic: string;
    google: string;
  }) {
    // Only initialize providers that have API keys
    this.gpt4 = apiKeys.openai ? new OpenAIProvider(apiKeys.openai, 'gpt-4o-mini') : null;
    this.claude = apiKeys.anthropic ? new AnthropicProvider(apiKeys.anthropic, 'claude-3-haiku-20240307') : null;
    this.gemini = apiKeys.google ? new GoogleProvider(apiKeys.google, 'gemini-1.5-flash') : null;
  }

  async parseResume(text: string): Promise<ParsedResume> {
    if (!this.gpt4) {
      throw new Error('GPT-4 provider not initialized. Please set OPENAI_API_KEY in environment.');
    }

    const response = await this.gpt4.generateText(
      EXTRACTION_USER_PROMPT(text),
      EXTRACTION_SYSTEM_PROMPT + "\nOutput MUST be valid JSON matching the ParsedResume interface."
    );

    try {
      // Basic extraction of JSON from response (handling potential markdown blocks)
      const jsonStr = response.content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr) as ParsedResume;
    } catch (error) {
      console.error('Failed to parse extraction JSON:', error);
      throw new Error('AI extraction failed to produce valid structured data');
    }
  }

  async enhanceProfile(parsedData: ParsedResume): Promise<EnhancedProfile> {
    // Phase 2 logic:
    // 1. Claude handles narrative enhancement
    // 2. Gemini handles ATS/Industry optimization
    // 3. We merge them (simplified for now)

    if (!this.claude) {
      throw new Error('Claude provider not initialized. Please set ANTHROPIC_API_KEY in environment.');
    }

    const claudeResponse = await this.claude.generateText(
      ENHANCEMENT_USER_PROMPT(parsedData),
      ENHANCEMENT_SYSTEM_PROMPT + "\nFocus on narrative and professional tone."
    );

    // Placeholder for actual merging and enhancement logic
    // In a real implementation, we would call multiple models and synthesize the results

    return {
      original: parsedData,
      enhanced: {
        summary: {
          recommended: claudeResponse.content,
          claudeVersion: claudeResponse.content
        },
        experience: parsedData.experience.map(exp => ({
          ...exp,
          aiEnhanced: {
            description: exp.description,
            highlights: exp.highlights,
            impactMetrics: []
          },
          confidence: 1
        })),
        skills: {
          technical: parsedData.skills.filter(s => s.category === 'technical'),
          soft: parsedData.skills.filter(s => s.category === 'soft'),
          languages: parsedData.languages || [],
          tools: parsedData.skills.filter(s => s.category === 'tool'),
          frameworks: parsedData.skills.filter(s => s.category === 'framework'),
        },
        projects: (parsedData.projects || []).map(p => ({
          ...p,
          aiEnhanced: {
            description: p.description,
            highlights: p.highlights,
            technicalDepth: 'Medium'
          },
          confidence: 1
        })),
        metadata: {
          industry: 'Technology', // Defaulting for now
          seniority: 'mid',
          yearsOfExperience: 5,
          specializations: []
        }
      },
      confidence: {
        overall: 1,
        summary: 1,
        experience: 1,
        skills: 1,
        projects: 1
      }
    };
  }

  /**
   * Generate portfolio content using AI
   * Used for manual portfolio creation
   */
  async generateContent(
    prompt: string,
    systemPrompt: string,
    preferredModel: 'gpt4' | 'claude' | 'gemini' = 'gpt4'
  ) {
    // Fallback to available provider if preferred is not available
    let provider;

    if (preferredModel === 'gpt4' && this.gpt4) {
      provider = this.gpt4;
    } else if (preferredModel === 'claude' && this.claude) {
      provider = this.claude;
    } else if (preferredModel === 'gemini' && this.gemini) {
      provider = this.gemini;
    } else {
      // Fallback to any available provider
      provider = this.claude || this.gemini || this.gpt4;
    }

    if (!provider) {
      throw new Error('No AI provider available. Please configure API keys.');
    }

    return await provider.generateText(prompt, systemPrompt);
  }
}
