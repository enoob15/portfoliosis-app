'use server';

import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { ParsedResume, EnhancedProfile } from '@/types/profile';

export async function enhanceProfile(parsedData: ParsedResume): Promise<{ success: boolean; data?: EnhancedProfile; error?: string }> {
  try {
    // Check if we have API keys configured
    const apiKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      google: process.env.GOOGLE_AI_API_KEY || ''
    };

    if (!apiKeys.openai && !apiKeys.anthropic && !apiKeys.google) {
      return { success: false, error: 'No AI API keys configured. Please check your environment variables.' };
    }

    const orchestrator = new AIOrchestrator(apiKeys);
    const enhancedProfile = await orchestrator.enhanceProfile(parsedData);

    return { success: true, data: enhancedProfile };
  } catch (error) {
    console.error('Enhance Profile Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to enhance profile' };
  }
}