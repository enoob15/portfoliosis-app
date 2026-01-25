import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export interface ResumeProfile {
    contact: {
        name: string;
        email: string;
        phone: string;
        linkedin?: string;
        website?: string;
        location?: string;
    };
    summary: string;
    experience: {
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        description: string;
        highlights: string[];
    }[];
    education: {
        institution: string;
        degree: string;
        field: string;
        startDate: string;
        endDate: string;
    }[];
    skills: {
        category: string;
        items: string[];
    }[];
    projects: {
        name: string;
        description: string;
        technologies: string[];
        link?: string;
    }[];
}

export async function extractResumeData(text: string): Promise<ResumeProfile> {
    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `
    You are an expert Resume Parser. Your job is to extract structured data from the following resume text.
    Return ONLY a valid JSON object matching this schema:
    {
      "contact": { "name": "", "email": "", "phone": "", "linkedin": "", "website": "", "location": "" },
      "summary": "Professional summary or objective",
      "experience": [{ "company": "", "position": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "description": "", "highlights": [""] }],
      "education": [{ "institution": "", "degree": "", "field": "", "startDate": "", "endDate": "" }],
      "skills": [{ "category": "Technical/Soft/Languages", "items": [""] }],
      "projects": [{ "name": "", "description": "", "technologies": [""], "link": "" }]
    }

    Resume Text:
    ${text}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonString = response.text();
        return JSON.parse(jsonString) as ResumeProfile;
    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        throw new Error("Failed to extract data via AI");
    }
}
