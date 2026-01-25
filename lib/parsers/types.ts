export interface ResumeData {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount?: number;
  };
  parsed?: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      linkedin?: string;
      website?: string;
      location?: string;
    };
    skills?: string[];
    experience?: {
      company: string;
      position: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }[];
    education?: {
      institution: string;
      degree: string;
      year?: string;
    }[];
  };
}

export interface ParseResult {
  success: boolean;
  data?: ResumeData;
  error?: string;
}
