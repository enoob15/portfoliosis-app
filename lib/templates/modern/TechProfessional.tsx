import React from 'react';
import { ResumeProfile } from '@/lib/ai/gemini';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink, Calendar } from 'lucide-react';

export default function TechProfessional({ data }: { data: ResumeProfile }) {
    const { contact, summary, experience, education, skills, projects } = data;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Section */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                                {contact.name}
                            </h1>
                            {contact.location && (
                                <div className="flex items-center text-gray-500">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{contact.location}</span>
                                </div>
                            )}
                            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                                {summary}
                            </p>
                        </div>

                        {/* Contact Links */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                    <Mail className="w-4 h-4 mr-3" />
                                    {contact.email}
                                </a>
                            )}
                            {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                    <Phone className="w-4 h-4 mr-3" />
                                    {contact.phone}
                                </a>
                            )}
                            {contact.linkedin && (
                                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                    <Linkedin className="w-4 h-4 mr-3" />
                                    LinkedIn
                                </a>
                            )}
                            {contact.website && (
                                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                                    <Globe className="w-4 h-4 mr-3" />
                                    Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-20">

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Skills & Expertise</h2>
                        <div className="flex flex-col gap-6">
                            {skills.map((skillGroup, idx) => (
                                <div key={idx}>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{skillGroup.category}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skillGroup.items.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-8">Work Experience</h2>
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-12">
                            {experience.map((job, idx) => (
                                <div key={idx} className="relative pl-8 md:pl-12">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-600" />

                                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900">{job.position}</h3>
                                        <div className="flex items-center text-sm font-medium text-gray-500">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {job.startDate} — {job.endDate}
                                        </div>
                                    </div>

                                    <div className="text-lg text-blue-600 font-medium mb-4">{job.company}</div>

                                    <p className="text-gray-600 mb-4 leading-relaxed">{job.description}</p>

                                    {job.highlights && job.highlights.length > 0 && (
                                        <ul className="list-disc list-outside ml-5 space-y-2 text-gray-600">
                                            {job.highlights.map((highlight, hIdx) => (
                                                <li key={hIdx}>{highlight}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-8">Featured Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map((project, idx) => (
                                <Card key={idx} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl font-bold text-gray-900">{project.name}</CardTitle>
                                            {project.link && (
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600 leading-relaxed">{project.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.technologies.map((tech) => (
                                                <span key={tech} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Education</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {education.map((edu, idx) => (
                                <div key={idx} className="p-6 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-bold text-gray-900">{edu.institution}</h3>
                                    <div className="text-blue-600 font-medium">{edu.degree} in {edu.field}</div>
                                    <div className="text-sm text-gray-500 mt-2">{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="bg-white border-t border-gray-200 py-12 mt-20">
                <div className="max-w-5xl mx-auto px-6 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} {contact.name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
