/**
 * AI Integration Example
 *
 * This file demonstrates how to integrate the AI assistance infrastructure
 * into portfolio creation step components.
 */

import React, { useState } from 'react';
import { useAIAssist } from '@/hooks/useAIAssist';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Example 1: Summary Generation Component
export function SummaryGeneratorExample() {
  const [selectedTone, setSelectedTone] = useState<'professional' | 'conversational' | 'creative'>('professional');
  const { generate, generating, result } = useAIAssist({
    onSuccess: (summaries) => {
      console.log('Generated summaries:', summaries);
    }
  });

  const handleGenerate = async () => {
    await generate('summary', {
      name: 'John Doe',
      title: 'Senior Software Engineer',
      yearsExperience: 8,
      skills: ['TypeScript', 'React', 'Node.js', 'AWS'],
      industry: 'Technology'
    });
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating summaries...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Summaries
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-3">
          <h4 className="font-medium">Choose your style:</h4>

          {(['professional', 'conversational', 'creative'] as const).map((tone) => (
            <Card
              key={tone}
              className={`p-4 cursor-pointer transition-all ${
                selectedTone === tone ? 'border-primary ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTone(tone)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize mb-2">{tone}</p>
                  <p className="text-sm text-muted-foreground">{result[tone]}</p>
                </div>
                {selectedTone === tone && (
                  <div className="ml-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M4.5 9L1.5 6L2.56 4.94L4.5 6.88L9.44 1.94L10.5 3L4.5 9Z" />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Example 2: Experience Enhancement Component
export function ExperienceEnhancerExample() {
  const [experience, setExperience] = useState({
    company: '',
    position: '',
    description: '',
    technologies: [] as string[]
  });

  const { generate, generating, result } = useAIAssist();

  const handleEnhance = async () => {
    if (!experience.company || !experience.position || !experience.description) {
      return;
    }

    await generate('experience', experience);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Company</label>
        <input
          type="text"
          value={experience.company}
          onChange={(e) => setExperience({ ...experience, company: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Position</label>
        <input
          type="text"
          value={experience.position}
          onChange={(e) => setExperience({ ...experience, position: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Current Description</label>
        <textarea
          value={experience.description}
          onChange={(e) => setExperience({ ...experience, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded"
          placeholder="Briefly describe your role and responsibilities..."
        />
      </div>

      <Button
        onClick={handleEnhance}
        disabled={generating || !experience.company || !experience.position || !experience.description}
        className="w-full"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Enhance with AI
          </>
        )}
      </Button>

      {result && (
        <Card className="p-4 space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Enhanced Description</p>
            <p className="text-sm text-muted-foreground">{result.enhancedDescription}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Key Highlights</p>
            <ul className="space-y-1">
              {result.highlights.map((highlight: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="mr-2">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExperience({ ...experience, description: result.enhancedDescription });
            }}
          >
            Use This Description
          </Button>
        </Card>
      )}
    </div>
  );
}

// Example 3: Skills Suggestion Component
export function SkillsSuggesterExample() {
  const { generate, generating, result } = useAIAssist();
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const handleSuggest = async () => {
    await generate('skills', {
      experiences: [
        {
          position: 'Senior Full Stack Developer',
          description: 'Led development of React-based web applications with Node.js backend and AWS infrastructure'
        },
        {
          position: 'DevOps Engineer',
          description: 'Managed CI/CD pipelines, Docker containers, and Kubernetes clusters'
        }
      ],
      existingSkills: ['React', 'Node.js', 'AWS', 'Docker']
    });
  };

  const toggleSkill = (skillName: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillName)) {
      newSelected.delete(skillName);
    } else {
      newSelected.add(skillName);
    }
    setSelectedSkills(newSelected);
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleSuggest} disabled={generating} className="w-full">
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing experience...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Suggest Skills
          </>
        )}
      </Button>

      {result && result.suggestions && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Suggested skills based on your experience:
          </p>

          <div className="flex flex-wrap gap-2">
            {result.suggestions.map((skill: { name: string; category: string }, index: number) => (
              <button
                key={index}
                onClick={() => toggleSkill(skill.name)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedSkills.has(skill.name)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill.name}
                <span className="ml-1 text-xs opacity-75">({skill.category})</span>
              </button>
            ))}
          </div>

          {selectedSkills.size > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Selected {selectedSkills.size} skill{selectedSkills.size !== 1 ? 's' : ''}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  console.log('Adding skills:', Array.from(selectedSkills));
                  // Add to form data
                }}
              >
                Add Selected Skills
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Example 4: Inline AI Assist Button
export function InlineAIAssistButton({
  contentType,
  input,
  onResult
}: {
  contentType: 'summary' | 'experience' | 'project' | 'skills' | 'rewrite';
  input: any;
  onResult: (result: any) => void;
}) {
  const { generate, generating } = useAIAssist({
    onSuccess: onResult
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => generate(contentType, input)}
      disabled={generating}
      className="text-primary hover:text-primary"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Sparkles className="mr-1 h-4 w-4" />
          AI Assist
        </>
      )}
    </Button>
  );
}

// Example 5: Project Description Generator
export function ProjectDescriptionGeneratorExample() {
  const [project, setProject] = useState({
    name: '',
    technologies: [] as string[],
    basicDescription: '',
    type: 'professional' as 'personal' | 'professional' | 'open-source'
  });

  const { generate, generating, result } = useAIAssist();

  const handleGenerate = async () => {
    if (!project.name || !project.basicDescription || project.technologies.length === 0) {
      return;
    }

    await generate('project', project);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Project Name</label>
        <input
          type="text"
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Brief Description</label>
        <textarea
          value={project.basicDescription}
          onChange={(e) => setProject({ ...project, basicDescription: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border rounded"
          placeholder="What does this project do?"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={generating || !project.name || !project.basicDescription}
        className="w-full"
      >
        {generating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating description...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Project Description
          </>
        )}
      </Button>

      {result && (
        <Card className="p-4 space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Generated Description</p>
            <p className="text-sm text-muted-foreground">{result.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Key Highlights</p>
            <ul className="space-y-1">
              {result.highlights.map((highlight: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="mr-2">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
