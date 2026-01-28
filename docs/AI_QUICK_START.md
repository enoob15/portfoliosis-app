# AI Assistance Quick Start Guide

**For Developers:** How to use AI assistance in your step components

---

## Setup (1 minute)

1. **Add API key to `.env.local`:**
```bash
OPENAI_API_KEY=sk-your-key-here
```

2. **That's it!** The infrastructure is ready to use.

---

## Basic Usage

### 1. Import the Hook

```typescript
import { useAIAssist } from '@/hooks/useAIAssist';
```

### 2. Use in Your Component

```typescript
const { generate, generating, result } = useAIAssist({
  onSuccess: (content) => {
    // Do something with the generated content
    console.log(content);
  }
});
```

### 3. Generate Content

```typescript
const handleGenerate = async () => {
  await generate('summary', {
    name: 'John Doe',
    title: 'Software Engineer',
    skills: ['JavaScript', 'React']
  });
};
```

---

## Using AIAssistButton Component

### Quick Example

```typescript
import { AIAssistButton } from '@/components/portfolio/shared/AIAssistButton';

<AIAssistButton
  type="summary"
  input={{
    name: formData.name,
    title: formData.title,
    skills: formData.skills
  }}
  onSelect={(content) => {
    // User selected this variation
    setValue('summary', content);
  }}
  label="Generate with AI"
/>
```

---

## AI Content Types

### 1. Summary (3 variations)

**Type:** `'summary'`

**Input:**
```typescript
{
  name: string;
  title: string;
  yearsExperience?: number;
  skills: string[];
  industry?: string;
}
```

**Output:**
```typescript
{
  professional: string;
  conversational: string;
  creative: string;
}
```

**Example:**
```typescript
<AIAssistButton
  type="summary"
  input={{
    name: 'Jane Smith',
    title: 'Product Designer',
    yearsExperience: 5,
    skills: ['Figma', 'User Research', 'Prototyping'],
    industry: 'Technology'
  }}
  onSelect={(variation) => setValue('summary', variation)}
/>
```

---

### 2. Experience Enhancement

**Type:** `'experience'`

**Input:**
```typescript
{
  company: string;
  position: string;
  description: string;
  technologies?: string[];
}
```

**Output:**
```typescript
{
  enhancedDescription: string;
  highlights: string[];
}
```

**Example:**
```typescript
<AIAssistButton
  type="experience"
  input={{
    company: 'Acme Corp',
    position: 'Senior Developer',
    description: 'Built web apps with React',
    technologies: ['React', 'Node.js', 'AWS']
  }}
  onSelect={(result) => {
    setValue('description', result.enhancedDescription);
    setValue('highlights', result.highlights);
  }}
/>
```

---

### 3. Project Description

**Type:** `'project'`

**Input:**
```typescript
{
  name: string;
  technologies: string[];
  basicDescription: string;
  type?: 'personal' | 'professional' | 'open-source';
}
```

**Output:**
```typescript
{
  description: string;
  highlights: string[];
}
```

**Example:**
```typescript
<AIAssistButton
  type="project"
  input={{
    name: 'Task Manager App',
    technologies: ['React', 'Firebase'],
    basicDescription: 'Todo app with real-time sync',
    type: 'personal'
  }}
  onSelect={(result) => {
    setValue('description', result.description);
    setValue('highlights', result.highlights);
  }}
/>
```

---

### 4. Skills Suggestions

**Type:** `'skills'`

**Input:**
```typescript
{
  experiences: Array<{
    position: string;
    description: string;
  }>;
  existingSkills: string[];
}
```

**Output:**
```typescript
{
  suggestions: Array<{
    name: string;
    category: 'technical' | 'soft' | 'language' | 'tool' | 'framework';
  }>;
}
```

**Example:**
```typescript
<AIAssistButton
  type="skills"
  input={{
    experiences: [
      {
        position: 'Full Stack Developer',
        description: 'Built apps with React and Node'
      }
    ],
    existingSkills: ['React', 'Node.js']
  }}
  onSelect={(skill) => {
    // Add individual skill
    addSkill(skill.name, skill.category);
  }}
/>
```

---

### 5. Content Rewriting

**Type:** `'rewrite'`

**Input:**
```typescript
{
  content: string;
  context: string;
  tone?: 'professional' | 'conversational' | 'creative';
}
```

**Output:**
```typescript
{
  rewritten: string;
}
```

**Example:**
```typescript
<AIAssistButton
  type="rewrite"
  input={{
    content: 'I worked on projects',
    context: 'Professional summary',
    tone: 'professional'
  }}
  onSelect={(result) => setValue('content', result.rewritten)}
/>
```

---

## Best Practices

### 1. Conditional Rendering

Only show AI button when required fields are filled:

```typescript
{formData.name && formData.title && (
  <AIAssistButton
    type="summary"
    input={{ name: formData.name, title: formData.title }}
    onSelect={handleSelect}
  />
)}
```

### 2. Loading States

The AIAssistButton handles loading states automatically:

```typescript
// The button shows a spinner and disables during generation
<AIAssistButton
  type="summary"
  input={data}
  onSelect={handleSelect}
  // No need to manage loading state manually!
/>
```

### 3. Error Handling

Errors are handled automatically with toast notifications:

```typescript
const { generate, error } = useAIAssist({
  onError: (errorMessage) => {
    // Optional: Additional error handling
    console.error(errorMessage);
  }
});
```

### 4. Manual Generation (without button)

Sometimes you want to generate without showing a button:

```typescript
const { generate, generating } = useAIAssist();

const autoGenerate = async () => {
  const result = await generate('summary', {
    name: 'John',
    title: 'Developer',
    skills: ['React']
  });

  setValue('summary', result.professional);
};
```

---

## Common Patterns

### Pattern 1: Generate on Demand

```typescript
export function MyStep() {
  const { generate, generating } = useAIAssist();
  const [summary, setSummary] = useState('');

  const handleGenerate = async () => {
    const result = await generate('summary', myData);
    setSummary(result.professional);
  };

  return (
    <div>
      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
      <Button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate with AI'}
      </Button>
    </div>
  );
}
```

### Pattern 2: Modal with Variations

```typescript
export function MyStep() {
  return (
    <div>
      <textarea value={summary} onChange={handleChange} />
      <AIAssistButton
        type="summary"
        input={myData}
        onSelect={(content) => setSummary(content)}
        label="✨ AI Assist"
      />
    </div>
  );
}
```

### Pattern 3: Auto-enhance Array Items

```typescript
export function ExperienceList() {
  const [experiences, setExperiences] = useState([]);

  const handleEnhance = (id, aiResult) => {
    setExperiences(experiences.map(exp =>
      exp.id === id
        ? { ...exp, description: aiResult.enhancedDescription }
        : exp
    ));
  };

  return experiences.map(exp => (
    <div key={exp.id}>
      <input value={exp.description} />
      <AIAssistButton
        type="experience"
        input={exp}
        onSelect={(result) => handleEnhance(exp.id, result)}
      />
    </div>
  ));
}
```

---

## Troubleshooting

### "No AI API keys configured" Error

**Solution:** Add at least one API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

### AI Button Not Showing

**Check:**
1. Are required fields filled?
2. Is the conditional rendering correct?
3. Is the import path correct?

### Generation Takes Too Long

**Causes:**
- Slow API response (normal: 2-5 seconds)
- Large input data
- Network issues

**Solution:**
- Reduce input size
- Show loading state (already handled by AIAssistButton)
- Implement timeout (already set to 60 seconds)

### Generated Content Quality Issues

**Solutions:**
1. Provide more detailed input
2. Use the regenerate button
3. Edit the generated content manually
4. Try different AI providers (GPT-4 vs Claude vs Gemini)

---

## Testing

### Test Individual AI Types

```typescript
// Test summary generation
const result = await generate('summary', {
  name: 'Test User',
  title: 'Test Title',
  skills: ['Skill1', 'Skill2']
});

console.log(result.professional);
```

### Run Test Suite

```bash
npx tsx scripts/test-ai-integration.ts
```

---

## Reference

- **Hook:** `hooks/useAIAssist.ts`
- **Component:** `components/portfolio/shared/AIAssistButton.tsx`
- **Prompts:** `lib/ai/prompts/portfolio-prompts.ts`
- **Server Actions:** `app/actions/manual-portfolio.ts`
- **Examples:** `docs/AI_INTEGRATION_EXAMPLE.tsx`

---

## Need Help?

1. Check `docs/AI_INFRASTRUCTURE_USAGE.md` for detailed API reference
2. See `docs/AI_INTEGRATION_EXAMPLE.tsx` for complete examples
3. Review `docs/AI_IMPLEMENTATION_STATUS.md` for implementation details
4. Run test script: `npx tsx scripts/test-ai-integration.ts`

---

**That's it!** You're ready to add AI assistance to any step component. 🚀
