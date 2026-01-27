'use server';

import { createSessionClient } from '@/lib/db/supabase-server';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import {
  generateSummaryPrompt,
  enhanceExperiencePrompt,
  generateProjectPrompt,
  suggestSkillsPrompt,
  rewriteContentPrompt,
  PORTFOLIO_SYSTEM_PROMPTS
} from '@/lib/ai/prompts/portfolio-prompts';
import { ParsedResume } from '@/types/profile';

/**
 * Generate AI-powered portfolio content
 */
export async function generatePortfolioContent(
  type: 'summary' | 'experience' | 'project' | 'skills' | 'rewrite',
  input: any
) {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get API keys from environment
  const apiKeys = {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || ''
  };

  // Validate at least one API key is present
  if (!apiKeys.openai && !apiKeys.anthropic && !apiKeys.google) {
    throw new Error('No AI API keys configured');
  }

  const orchestrator = new AIOrchestrator(apiKeys);

  let prompt: string;
  let systemPrompt: string;

  switch (type) {
    case 'summary':
      prompt = generateSummaryPrompt(input);
      systemPrompt = PORTFOLIO_SYSTEM_PROMPTS.summary;
      break;
    case 'experience':
      prompt = enhanceExperiencePrompt(input);
      systemPrompt = PORTFOLIO_SYSTEM_PROMPTS.experience;
      break;
    case 'project':
      prompt = generateProjectPrompt(input);
      systemPrompt = PORTFOLIO_SYSTEM_PROMPTS.project;
      break;
    case 'skills':
      prompt = suggestSkillsPrompt(input);
      systemPrompt = PORTFOLIO_SYSTEM_PROMPTS.skills;
      break;
    case 'rewrite':
      prompt = rewriteContentPrompt(input);
      systemPrompt = PORTFOLIO_SYSTEM_PROMPTS.rewrite;
      break;
    default:
      throw new Error('Invalid content type');
  }

  try {
    // Determine which provider to use based on available API keys
    let preferredModel: 'gpt4' | 'claude' | 'gemini' = 'gpt4';
    if (!apiKeys.openai && apiKeys.anthropic) {
      preferredModel = 'claude';
    } else if (!apiKeys.openai && !apiKeys.anthropic && apiKeys.google) {
      preferredModel = 'gemini';
    }

    // Use available AI provider for content generation
    const result = await orchestrator.generateContent(
      prompt,
      systemPrompt + '\nOutput MUST be valid JSON.',
      preferredModel
    );

    // Parse JSON response
    const jsonStr = result.content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}

/**
 * Save manual portfolio draft to database
 */
export async function saveManualPortfolioDraft(
  data: Partial<ParsedResume>,
  draftId?: string
) {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    if (draftId) {
      // Update existing draft
      const { data: updated, error } = await supabase
        .from('portfolios')
        .update({
          manual_data: data,
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, draftId: updated.id };
    } else {
      // Create new draft
      // Generate a unique slug for the draft
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const slug = `draft-${timestamp}-${randomStr}`;
      const name = data.personal?.name || 'Untitled Portfolio';

      const { data: created, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: name,
          slug: slug,
          manual_data: data,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, draftId: created.id };
    }
  } catch (error) {
    console.error('Failed to save draft:', error);
    throw new Error('Failed to save draft');
  }
}

/**
 * Load manual portfolio draft from database
 */
export async function loadManualPortfolioDraft(draftId: string) {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data.manual_data,
      draftId: data.id
    };
  } catch (error) {
    console.error('Failed to load draft:', error);
    throw new Error('Failed to load draft');
  }
}

/**
 * Submit manual portfolio (mark as complete)
 */
export async function submitManualPortfolio(
  data: ParsedResume,
  draftId: string,
  templateId?: string
) {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update({
        manual_data: data,
        status: 'completed',
        template_id: templateId,
        updated_at: new Date().toISOString()
      })
      .eq('id', draftId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      portfolioId: portfolio.id
    };
  } catch (error) {
    console.error('Failed to submit portfolio:', error);
    throw new Error('Failed to submit portfolio');
  }
}

/**
 * Delete manual portfolio draft
 */
export async function deleteManualPortfolioDraft(draftId: string) {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', draftId)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to delete draft:', error);
    throw new Error('Failed to delete draft');
  }
}
