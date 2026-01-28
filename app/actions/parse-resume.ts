'use server';

import { parsePdf } from '@/lib/parsers/pdf-parser';
import { parseDocx } from '@/lib/parsers/docx-parser';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { ResumeData, ParseResult } from '@/lib/parsers/types';
import { ParsedResume } from '@/types/profile';
import { ResumeProfile } from '@/lib/ai/gemini';

export async function parseResume(formData: FormData): Promise<ParseResult> {
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      text = await parsePdf(buffer);
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      text = await parseDocx(buffer);
    } else {
      const isLegacyDoc = file.type === 'application/msword' || file.name.endsWith('.doc');
      const errorMsg = isLegacyDoc 
        ? 'Legacy .doc files are not supported. Please save as .docx or PDF and try again.'
        : 'Unsupported file type. Please upload PDF or DOCX.';
      return { success: false, error: errorMsg };
    }

    if (!text || text.trim().length === 0) {
      return { success: false, error: 'Could not extract text from file.' };
    }

    // Check if we have API keys configured
    const apiKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      google: process.env.GOOGLE_AI_API_KEY || ''
    };

    if (!apiKeys.openai && !apiKeys.anthropic && !apiKeys.google) {
      return { success: false, error: 'No AI API keys configured. Please check your environment variables.' };
    }

    // Use AI orchestrator for parsing (fallback to Gemini if others unavailable)
    if (apiKeys.openai) {
      const orchestrator = new AIOrchestrator(apiKeys);
      const parsedData = await orchestrator.parseResume(text);

      const resumeData: ResumeData = {
        text,
        metadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          pageCount: undefined
        },
        parsed: {
          personalInfo: {
            name: parsedData.personal.name,
            email: parsedData.personal.email,
            phone: parsedData.personal.phone,
            linkedin: parsedData.personal.social?.linkedin,
            website: parsedData.personal.website,
            location: parsedData.personal.location
          },
          skills: parsedData.skills.map(skill => skill.name),
          experience: parsedData.experience.map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description
          })),
          education: parsedData.education.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            year: edu.endDate
          }))
        }
      };

      return { success: true, data: resumeData };
    } else {
      // Fallback to Gemini
      const { extractResumeData } = await import('@/lib/ai/gemini');
      const geminiData = await extractResumeData(text);

      const resumeData: ResumeData = {
        text,
        metadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          pageCount: undefined
        },
        parsed: {
          personalInfo: {
            name: geminiData.contact.name,
            email: geminiData.contact.email,
            phone: geminiData.contact.phone,
            linkedin: geminiData.contact.linkedin,
            website: geminiData.contact.website,
            location: geminiData.contact.location
          },
          skills: geminiData.skills.flatMap(skill => skill.items),
          experience: geminiData.experience.map(exp => ({
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate,
            endDate: exp.endDate,
            description: exp.description
          })),
          education: geminiData.education.map(edu => ({
            institution: edu.institution,
            degree: edu.degree,
            year: edu.endDate
          }))
        }
      };

      return { success: true, data: resumeData };
    }
  } catch (error) {
    console.error('Parse Resume Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to parse resume' };
  }
}
