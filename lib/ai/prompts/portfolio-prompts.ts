/**
 * AI prompt templates for portfolio content generation
 */

export const generateSummaryPrompt = (input: {
  name: string;
  title: string;
  yearsExperience?: number;
  skills: string[];
  industry?: string;
}) => `
Generate a professional summary for a portfolio.

Name: ${input.name}
Title: ${input.title}
Years of Experience: ${input.yearsExperience || 'Not specified'}
Key Skills: ${input.skills.join(', ')}
${input.industry ? `Industry: ${input.industry}` : ''}

Create 3 variations:
1. PROFESSIONAL (formal, corporate tone)
2. CONVERSATIONAL (friendly, approachable tone)
3. CREATIVE (unique, memorable tone)

Each should be:
- 2-3 sentences
- Highlight key strengths
- Be compelling and authentic
- Avoid clichés

Return as JSON:
{
  "professional": "...",
  "conversational": "...",
  "creative": "..."
}
`;

export const enhanceExperiencePrompt = (input: {
  company: string;
  position: string;
  description: string;
  technologies?: string[];
}) => `
Enhance this job experience description for a portfolio.

Company: ${input.company}
Position: ${input.position}
Current Description: ${input.description}
${input.technologies ? `Technologies: ${input.technologies.join(', ')}` : ''}

Improve the description by:
- Using strong action verbs
- Quantifying impact where possible
- Highlighting leadership and initiative
- Making it concise and impactful

Also generate 3-5 key achievement highlights as bullet points.

Return as JSON:
{
  "enhancedDescription": "...",
  "highlights": ["...", "...", "..."]
}
`;

export const generateProjectPrompt = (input: {
  name: string;
  technologies: string[];
  basicDescription: string;
  type?: 'personal' | 'professional' | 'open-source';
}) => `
Generate a compelling project description for a portfolio.

Project Name: ${input.name}
Technologies: ${input.technologies.join(', ')}
Basic Description: ${input.basicDescription}
Project Type: ${input.type || 'Not specified'}

Create a description that:
- Explains what the project does
- Highlights technical challenges solved
- Emphasizes impact or results
- Is engaging and clear
- Is 2-3 sentences

Also generate 3-4 key highlights as bullet points.

Return as JSON:
{
  "description": "...",
  "highlights": ["...", "...", "..."]
}
`;

export const suggestSkillsPrompt = (input: {
  experiences: Array<{ position: string; description: string }>;
  existingSkills: string[];
}) => `
Based on this work experience, suggest additional skills to add to a portfolio.

Work Experience:
${input.experiences.map(exp => `- ${exp.position}: ${exp.description}`).join('\n')}

Existing Skills: ${input.existingSkills.join(', ')}

Suggest 5-10 additional skills that are:
- Relevant to the experience
- Not already listed
- Valuable for the industry
- Specific (not generic)

Categorize each skill as: technical, soft, language, tool, or framework

Return as JSON:
{
  "suggestions": [
    { "name": "...", "category": "technical" },
    ...
  ]
}
`;

export const rewriteContentPrompt = (input: {
  content: string;
  context: string;
  tone?: 'professional' | 'conversational' | 'creative';
}) => `
Rewrite this portfolio content to improve clarity and impact.

Content to Rewrite: ${input.content}
Context: ${input.context}
Desired Tone: ${input.tone || 'professional'}

Rewrite the content to be:
- More compelling and engaging
- Clear and concise
- Free of clichés and generic phrases
- Authentic and specific
- Appropriate for a professional portfolio

Return as JSON:
{
  "rewritten": "..."
}
`;

export const generateImageCaptionPrompt = (input: {
  projectName: string;
  category: 'screenshot' | 'certificate' | 'award' | 'whitepaper' | 'process';
  context?: string;
}) => `
Generate a caption for a portfolio image.

Project: ${input.projectName}
Image Category: ${input.category}
${input.context ? `Context: ${input.context}` : ''}

Create a caption that:
- Describes what the image shows
- Relates to the project/achievement
- Is concise (1-2 sentences)
- Is professional and descriptive

Return as JSON:
{
  "caption": "..."
}
`;

// System prompts for different content types
export const PORTFOLIO_SYSTEM_PROMPTS = {
  summary: 'You are a professional portfolio content writer specializing in compelling personal summaries. Generate authentic, achievement-focused content that highlights the candidate\'s unique value proposition.',

  experience: 'You are an expert resume and portfolio writer. Transform job descriptions into impactful narratives that showcase achievements, leadership, and measurable results.',

  project: 'You are a technical portfolio writer who excels at describing projects in a way that highlights both technical depth and business impact.',

  skills: 'You are a career coach who helps professionals identify and articulate their technical and soft skills based on their experience.',

  rewrite: 'You are an expert editor specializing in portfolio content. Improve clarity, impact, and professionalism while maintaining authenticity.',

  caption: 'You are a technical writer who creates clear, descriptive captions for portfolio visuals.'
};
