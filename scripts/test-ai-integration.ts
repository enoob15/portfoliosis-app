/**
 * AI Integration Test Script
 *
 * This script tests all AI generation features for the Manual Portfolio Creation wizard.
 * Run with: tsx scripts/test-ai-integration.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { AIOrchestrator } from '../lib/ai/orchestrator';
import {
  generateSummaryPrompt,
  enhanceExperiencePrompt,
  generateProjectPrompt,
  suggestSkillsPrompt,
  PORTFOLIO_SYSTEM_PROMPTS
} from '../lib/ai/prompts/portfolio-prompts';

// Test data
const TEST_DATA = {
  summary: {
    name: 'John Doe',
    title: 'Senior Full Stack Developer',
    yearsExperience: 8,
    skills: ['TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
    industry: 'Technology'
  },
  experience: {
    company: 'Tech Innovations Inc',
    position: 'Senior Software Engineer',
    description: 'Led development of web applications using React and Node.js. Managed team of 5 developers.',
    technologies: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
  },
  project: {
    name: 'E-Commerce Platform',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind'],
    basicDescription: 'Built a full-featured online store with payment integration and admin dashboard',
    type: 'professional' as const
  },
  skills: {
    experiences: [
      {
        position: 'Senior Full Stack Developer',
        description: 'Developed web applications using React, Node.js, and AWS. Implemented CI/CD pipelines.'
      },
      {
        position: 'Frontend Engineer',
        description: 'Built responsive UIs with React and TypeScript. Optimized performance and accessibility.'
      }
    ],
    existingSkills: ['React', 'Node.js', 'TypeScript', 'AWS']
  }
};

async function testAIIntegration() {
  console.log('🤖 AI Integration Test Suite\n');
  console.log('='.repeat(60));

  // Check API keys (checking both possible env variable names)
  const apiKeys = {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY || ''
  };

  console.log('\n📋 API Keys Configuration:');
  console.log(`  OpenAI: ${apiKeys.openai ? '✓ Configured (' + apiKeys.openai.substring(0, 20) + '...)' : '✗ Missing'}`);
  console.log(`  Anthropic: ${apiKeys.anthropic ? '✓ Configured (' + apiKeys.anthropic.substring(0, 20) + '...)' : '✗ Missing'}`);
  console.log(`  Google: ${apiKeys.google ? '✓ Configured (' + apiKeys.google.substring(0, 20) + '...)' : '✗ Missing'}`);

  if (!apiKeys.openai && !apiKeys.anthropic && !apiKeys.google) {
    console.error('\n❌ No API keys configured. Please set at least one in .env.local');
    process.exit(1);
  }

  const orchestrator = new AIOrchestrator(apiKeys);

  // Test 1: Summary Generation
  console.log('\n\n1️⃣ Testing Summary Generation');
  console.log('-'.repeat(60));
  try {
    const summaryPrompt = generateSummaryPrompt(TEST_DATA.summary);
    console.log('Input:', JSON.stringify(TEST_DATA.summary, null, 2));
    console.log('\nGenerating...');

    const result = await orchestrator.generateContent(
      summaryPrompt,
      PORTFOLIO_SYSTEM_PROMPTS.summary + '\nOutput MUST be valid JSON.',
      'gemini' // Using Gemini since it's available
    );

    const summaries = JSON.parse(result.content.replace(/```json\n?|\n?```/g, '').trim());
    console.log('\n✓ Success! Generated summaries:');
    console.log(`\nProfessional:\n${summaries.professional}`);
    console.log(`\nConversational:\n${summaries.conversational}`);
    console.log(`\nCreative:\n${summaries.creative}`);
    console.log(`\nTokens used: ${result.usage?.totalTokens || 'N/A'}`);
  } catch (error) {
    console.error('✗ Failed:', error instanceof Error ? error.message : error);
  }

  // Test 2: Experience Enhancement
  console.log('\n\n2️⃣ Testing Experience Enhancement');
  console.log('-'.repeat(60));
  try {
    const experiencePrompt = enhanceExperiencePrompt(TEST_DATA.experience);
    console.log('Input:', JSON.stringify(TEST_DATA.experience, null, 2));
    console.log('\nEnhancing...');

    const result = await orchestrator.generateContent(
      experiencePrompt,
      PORTFOLIO_SYSTEM_PROMPTS.experience + '\nOutput MUST be valid JSON.',
      'gemini'
    );

    const enhanced = JSON.parse(result.content.replace(/```json\n?|\n?```/g, '').trim());
    console.log('\n✓ Success! Enhanced experience:');
    console.log(`\nEnhanced Description:\n${enhanced.enhancedDescription}`);
    console.log('\nHighlights:');
    enhanced.highlights.forEach((h: string, i: number) => console.log(`  ${i + 1}. ${h}`));
    console.log(`\nTokens used: ${result.usage?.totalTokens || 'N/A'}`);
  } catch (error) {
    console.error('✗ Failed:', error instanceof Error ? error.message : error);
  }

  // Test 3: Project Description Generation
  console.log('\n\n3️⃣ Testing Project Description Generation');
  console.log('-'.repeat(60));
  try {
    const projectPrompt = generateProjectPrompt(TEST_DATA.project);
    console.log('Input:', JSON.stringify(TEST_DATA.project, null, 2));
    console.log('\nGenerating...');

    const result = await orchestrator.generateContent(
      projectPrompt,
      PORTFOLIO_SYSTEM_PROMPTS.project + '\nOutput MUST be valid JSON.',
      'gemini'
    );

    const project = JSON.parse(result.content.replace(/```json\n?|\n?```/g, '').trim());
    console.log('\n✓ Success! Generated project:');
    console.log(`\nDescription:\n${project.description}`);
    console.log('\nHighlights:');
    project.highlights.forEach((h: string, i: number) => console.log(`  ${i + 1}. ${h}`));
    console.log(`\nTokens used: ${result.usage?.totalTokens || 'N/A'}`);
  } catch (error) {
    console.error('✗ Failed:', error instanceof Error ? error.message : error);
  }

  // Test 4: Skills Suggestions
  console.log('\n\n4️⃣ Testing Skills Suggestions');
  console.log('-'.repeat(60));
  try {
    const skillsPrompt = suggestSkillsPrompt(TEST_DATA.skills);
    console.log('Input experiences:', TEST_DATA.skills.experiences.length);
    console.log('Existing skills:', TEST_DATA.skills.existingSkills.join(', '));
    console.log('\nSuggesting...');

    const result = await orchestrator.generateContent(
      skillsPrompt,
      PORTFOLIO_SYSTEM_PROMPTS.skills + '\nOutput MUST be valid JSON.',
      'gemini'
    );

    const suggestions = JSON.parse(result.content.replace(/```json\n?|\n?```/g, '').trim());
    console.log('\n✓ Success! Suggested skills:');
    suggestions.suggestions.forEach((s: any, i: number) => {
      console.log(`  ${i + 1}. ${s.name} (${s.category})`);
    });
    console.log(`\nTokens used: ${result.usage?.totalTokens || 'N/A'}`);
  } catch (error) {
    console.error('✗ Failed:', error instanceof Error ? error.message : error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✓ AI Integration Tests Complete\n');
}

// Run tests
testAIIntegration().catch(console.error);
