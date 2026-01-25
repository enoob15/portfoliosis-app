import { OpenAIProvider } from './models/openai';
import { AnthropicProvider } from './models/anthropic';
import { GoogleProvider } from './models/google';
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT, ENHANCEMENT_SYSTEM_PROMPT, ENHANCEMENT_USER_PROMPT } from './prompts';
import { ParsedResume, EnhancedProfile } from '@/types/profile';

export class AIOrchestrator {
  private gpt4: OpenAIProvider;
  private claude: AnthropicProvider;
  private gemini: GoogleProvider;

  constructor(apiKeys: {
    openai: string;
    anthropic: string;
    google: string;
  }) {
    this.gpt4 = new OpenAIProvider(apiKeys.openai, 'gpt-4o-mini');
    this.claude = new AnthropicProvider(apiKeys.anthropic, 'claude-3-haiku-20240307');
    this.gemini = new GoogleProvider(apiKeys.google, 'gemini-1.5-flash');
  }

  async parseResume(text: string): Promise<ParsedResume> {
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
}
