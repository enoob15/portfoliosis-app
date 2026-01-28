# AI Infrastructure Usage Guide

## Overview

The AI assistance infrastructure for Manual Portfolio Creation provides intelligent content generation capabilities powered by multiple AI providers (GPT-4, Claude, Gemini).

## Architecture

### Files Created/Updated

1. **`lib/ai/prompts/portfolio-prompts.ts`** (185 lines)
   - Prompt generators for all portfolio content types
   - System prompts for different content generation tasks

2. **`hooks/useAIAssist.ts`** (64 lines)
   - React hook for AI content generation
   - Manages loading states, errors, and results
   - Toast notifications for user feedback

3. **`app/actions/manual-portfolio.ts`** (240 lines)
   - Server actions for AI generation
   - Database operations (save, load, submit, delete drafts)
   - Integration with AI orchestrator

4. **`lib/ai/orchestrator.ts`** (Updated)
   - Added `generateContent()` public method
   - Supports model selection (gpt4, claude, gemini)

## Usage Examples

### 1. Generate Professional Summary

```typescript
import { useAIAssist } from '@/hooks/useAIAssist';

function SummaryStep() {
  const { generate, generating, error, result } = useAIAssist({
    onSuccess: (content) => {
      console.log('Generated summaries:', content);
      // content = { professional: "...", conversational: "...", creative: "..." }
    }
  });

  const handleGenerate = async () => {
    await generate('summary', {
      name: 'John Doe',
      title: 'Senior Software Engineer',
      yearsExperience: 8,
      skills: ['TypeScript', 'React', 'Node.js'],
      industry: 'Technology'
    });
  };

  return (
    <Button onClick={handleGenerate} disabled={generating}>
      {generating ? 'Generating...' : 'Generate Summary'}
    </Button>
  );
}
```

### 2. Enhance Job Experience

```typescript
const { generate, generating } = useAIAssist();

const enhanceExperience = async () => {
  const enhanced = await generate('experience', {
    company: 'Tech Corp',
    position: 'Lead Developer',
    description: 'Led team of 5 developers on web projects',
    technologies: ['React', 'Node.js', 'AWS']
  });

  // enhanced = {
  //   enhancedDescription: "Spearheaded...",
  //   highlights: ["Increased...", "Reduced...", "Implemented..."]
  // }
};
```

### 3. Generate Project Description

```typescript
const { generate } = useAIAssist();

const generateProject = async () => {
  const project = await generate('project', {
    name: 'E-commerce Platform',
    technologies: ['Next.js', 'PostgreSQL', 'Stripe'],
    basicDescription: 'Built online store with payment integration',
    type: 'professional'
  });

  // project = {
  //   description: "Architected and deployed...",
  //   highlights: ["Processed...", "Integrated...", "Optimized..."]
  // }
};
```

### 4. Suggest Additional Skills

```typescript
const { generate } = useAIAssist();

const suggestSkills = async () => {
  const suggestions = await generate('skills', {
    experiences: [
      {
        position: 'Full Stack Developer',
        description: 'Built web apps with React and Node'
      },
      {
        position: 'DevOps Engineer',
        description: 'Managed AWS infrastructure'
      }
    ],
    existingSkills: ['React', 'Node.js', 'AWS']
  });

  // suggestions = {
  //   suggestions: [
  //     { name: "Docker", category: "tool" },
  //     { name: "CI/CD", category: "technical" },
  //     ...
  //   ]
  // }
};
```

### 5. Rewrite Content

```typescript
const { generate } = useAIAssist();

const rewriteContent = async () => {
  const rewritten = await generate('rewrite', {
    content: 'I worked on projects',
    context: 'Professional summary',
    tone: 'professional'
  });

  // rewritten = {
  //   rewritten: "Delivered enterprise-scale projects..."
  // }
};
```

## Hook API

### `useAIAssist(options?)`

**Options:**
- `onSuccess?: (content: any) => void` - Callback when generation succeeds
- `onError?: (error: string) => void` - Callback when generation fails

**Returns:**
- `generate(type, input)` - Async function to generate content
- `generating: boolean` - Loading state
- `error: string | null` - Error message if generation failed
- `result: any` - Last generated result
- `reset()` - Clear result and error

**Content Types:**
- `'summary'` - Professional summary with 3 tone variations
- `'experience'` - Enhanced job experience description
- `'project'` - Project description with highlights
- `'skills'` - Skill suggestions based on experience
- `'rewrite'` - Rewrite any content with desired tone

## Server Actions

### `generatePortfolioContent(type, input)`

Direct server action for AI generation. Used internally by the hook.

```typescript
import { generatePortfolioContent } from '@/app/actions/manual-portfolio';

const result = await generatePortfolioContent('summary', {
  name: 'John Doe',
  title: 'Engineer',
  skills: ['JavaScript']
});
```

### `saveManualPortfolioDraft(data, draftId?)`

Save portfolio draft to database.

```typescript
import { saveManualPortfolioDraft } from '@/app/actions/manual-portfolio';

const { success, draftId } = await saveManualPortfolioDraft({
  personal: { name: 'John', email: 'john@example.com' },
  summary: 'Experienced engineer...'
});
```

### `loadManualPortfolioDraft(draftId)`

Load existing draft from database.

```typescript
import { loadManualPortfolioDraft } from '@/app/actions/manual-portfolio';

const { success, data, draftId } = await loadManualPortfolioDraft('draft-id');
```

### `submitManualPortfolio(data, draftId, templateId?)`

Submit completed portfolio.

```typescript
import { submitManualPortfolio } from '@/app/actions/manual-portfolio';

const { success, portfolioId } = await submitManualPortfolio(
  completeData,
  'draft-id',
  'template-id'
);
```

### `deleteManualPortfolioDraft(draftId)`

Delete draft.

```typescript
import { deleteManualPortfolioDraft } from '@/app/actions/manual-portfolio';

const { success } = await deleteManualPortfolioDraft('draft-id');
```

## AI Provider Configuration

The system uses the `AIOrchestrator` class which requires API keys:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

**Default Models:**
- OpenAI: `gpt-4o-mini`
- Anthropic: `claude-3-haiku-20240307`
- Google: `gemini-1.5-flash`

## Error Handling

The hook automatically handles errors and displays toast notifications:

```typescript
const { generate, error } = useAIAssist({
  onError: (errorMessage) => {
    console.error('AI generation failed:', errorMessage);
    // Custom error handling
  }
});

try {
  await generate('summary', input);
} catch (err) {
  // Error is already logged and displayed via toast
  // Additional error handling if needed
}
```

## Best Practices

1. **Always check generating state** before triggering new generations
2. **Provide feedback** - The hook shows toast notifications automatically
3. **Handle errors gracefully** - Use the error state or onError callback
4. **Validate input** - Ensure required fields are present before calling generate
5. **Save frequently** - Use saveManualPortfolioDraft to prevent data loss
6. **Test with mock data** - Use the test file for reference

## Testing

Tests are located at `lib/ai/__tests__/portfolio-ai.test.ts`:

```bash
npm test -- portfolio-ai.test.ts
```

## Performance

- **Average generation time**: 2-5 seconds
- **Cost per generation**: ~$0.01 (varies by model and input size)
- **Rate limits**: Handled by individual AI providers
- **Caching**: Not implemented (future enhancement)

## Future Enhancements

- [ ] Response caching to reduce costs
- [ ] Batch generation for multiple items
- [ ] A/B testing different prompts
- [ ] User preference for AI model selection
- [ ] Streaming responses for real-time feedback
- [ ] Retry logic with exponential backoff
- [ ] Usage analytics and cost tracking
