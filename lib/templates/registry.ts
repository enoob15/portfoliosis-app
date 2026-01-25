import { ResumeProfile } from '@/lib/ai/gemini';
import { ReactNode } from 'react';

export interface PortfolioTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string; // Path to thumbnail image
    component: (props: { data: ResumeProfile }) => ReactNode;
}

import TechProfessional from './modern/TechProfessional';

const templates: PortfolioTemplate[] = [
    {
        id: 'modern-tech-professional',
        name: 'Tech Professional',
        description: 'A clean, minimalist template designed for software engineers and technical leaders.',
        thumbnail: '/templates/tech-professional.png', // Placeholder
        component: TechProfessional,
    },
];

export function registerTemplate(template: PortfolioTemplate) {
    templates.push(template);
}

export function getTemplate(id: string): PortfolioTemplate | undefined {
    return templates.find((t) => t.id === id);
}

export function getAllTemplates(): PortfolioTemplate[] {
    return templates;
}

// Helper to lazily load templates if needed, but for now strict imports are fine
