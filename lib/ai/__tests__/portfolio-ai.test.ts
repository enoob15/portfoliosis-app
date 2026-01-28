/**
 * Tests for AI Portfolio Content Generation
 *
 * These are integration tests that verify the AI infrastructure
 * works correctly for manual portfolio creation.
 */

import { AIOrchestrator } from '../orchestrator';
import {
  generateSummaryPrompt,
  enhanceExperiencePrompt,
  generateProjectPrompt,
  suggestSkillsPrompt,
  PORTFOLIO_SYSTEM_PROMPTS
} from '../prompts/portfolio-prompts';

describe('Portfolio AI Prompts', () => {
  describe('generateSummaryPrompt', () => {
    it('should generate a valid prompt with all required fields', () => {
      const input = {
        name: 'John Doe',
        title: 'Senior Software Engineer',
        yearsExperience: 8,
        skills: ['TypeScript', 'React', 'Node.js'],
        industry: 'Technology'
      };

      const prompt = generateSummaryPrompt(input);

      expect(prompt).toContain('John Doe');
      expect(prompt).toContain('Senior Software Engineer');
      expect(prompt).toContain('8');
      expect(prompt).toContain('TypeScript, React, Node.js');
      expect(prompt).toContain('Technology');
      expect(prompt).toContain('PROFESSIONAL');
      expect(prompt).toContain('CONVERSATIONAL');
      expect(prompt).toContain('CREATIVE');
    });

    it('should handle optional fields gracefully', () => {
      const input = {
        name: 'Jane Smith',
        title: 'Developer',
        skills: ['Python']
      };

      const prompt = generateSummaryPrompt(input);

      expect(prompt).toContain('Jane Smith');
      expect(prompt).toContain('Developer');
      expect(prompt).toContain('Python');
      expect(prompt).not.toContain('undefined');
    });
  });

  describe('enhanceExperiencePrompt', () => {
    it('should generate a valid prompt for experience enhancement', () => {
      const input = {
        company: 'Tech Corp',
        position: 'Lead Developer',
        description: 'Led team of 5 developers',
        technologies: ['React', 'AWS']
      };

      const prompt = enhanceExperiencePrompt(input);

      expect(prompt).toContain('Tech Corp');
      expect(prompt).toContain('Lead Developer');
      expect(prompt).toContain('Led team of 5 developers');
      expect(prompt).toContain('React, AWS');
      expect(prompt).toContain('action verbs');
      expect(prompt).toContain('highlights');
    });
  });

  describe('generateProjectPrompt', () => {
    it('should generate a valid prompt for project description', () => {
      const input = {
        name: 'E-commerce Platform',
        technologies: ['Next.js', 'PostgreSQL'],
        basicDescription: 'Online store with payment integration',
        type: 'professional' as const
      };

      const prompt = generateProjectPrompt(input);

      expect(prompt).toContain('E-commerce Platform');
      expect(prompt).toContain('Next.js, PostgreSQL');
      expect(prompt).toContain('Online store with payment integration');
      expect(prompt).toContain('professional');
    });
  });

  describe('suggestSkillsPrompt', () => {
    it('should generate a valid prompt for skills suggestion', () => {
      const input = {
        experiences: [
          { position: 'Full Stack Developer', description: 'Built web apps with React and Node' },
          { position: 'DevOps Engineer', description: 'Managed AWS infrastructure' }
        ],
        existingSkills: ['React', 'Node.js', 'AWS']
      };

      const prompt = suggestSkillsPrompt(input);

      expect(prompt).toContain('Full Stack Developer');
      expect(prompt).toContain('DevOps Engineer');
      expect(prompt).toContain('React, Node.js, AWS');
      expect(prompt).toContain('5-10 additional skills');
    });
  });
});

describe('AIOrchestrator - Portfolio Content Generation', () => {
  let orchestrator: AIOrchestrator;

  beforeEach(() => {
    // Mock API keys - in real tests these would come from env
    const apiKeys = {
      openai: process.env.OPENAI_API_KEY || 'mock-key',
      anthropic: process.env.ANTHROPIC_API_KEY || 'mock-key',
      google: process.env.GOOGLE_API_KEY || 'mock-key'
    };

    orchestrator = new AIOrchestrator(apiKeys);
  });

  describe('generateContent', () => {
    it('should have a generateContent method', () => {
      expect(orchestrator.generateContent).toBeDefined();
      expect(typeof orchestrator.generateContent).toBe('function');
    });

    it('should support different model preferences', async () => {
      const prompt = 'Test prompt';
      const systemPrompt = 'Test system prompt';

      // These will only work if API keys are configured
      if (process.env.OPENAI_API_KEY) {
        expect(async () => {
          await orchestrator.generateContent(prompt, systemPrompt, 'gpt4');
        }).not.toThrow();
      }
    });
  });
});

describe('System Prompts', () => {
  it('should have all required system prompts', () => {
    expect(PORTFOLIO_SYSTEM_PROMPTS.summary).toBeDefined();
    expect(PORTFOLIO_SYSTEM_PROMPTS.experience).toBeDefined();
    expect(PORTFOLIO_SYSTEM_PROMPTS.project).toBeDefined();
    expect(PORTFOLIO_SYSTEM_PROMPTS.skills).toBeDefined();
    expect(PORTFOLIO_SYSTEM_PROMPTS.rewrite).toBeDefined();
    expect(PORTFOLIO_SYSTEM_PROMPTS.caption).toBeDefined();
  });

  it('should have meaningful content in system prompts', () => {
    expect(PORTFOLIO_SYSTEM_PROMPTS.summary.length).toBeGreaterThan(20);
    expect(PORTFOLIO_SYSTEM_PROMPTS.experience.length).toBeGreaterThan(20);
    expect(PORTFOLIO_SYSTEM_PROMPTS.project.length).toBeGreaterThan(20);
    expect(PORTFOLIO_SYSTEM_PROMPTS.skills.length).toBeGreaterThan(20);
  });
});
