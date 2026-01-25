import React from 'react';
import { ResumeProfile } from '@/lib/ai/gemini';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface DataFormProps {
    data: ResumeProfile;
    onChange: (newData: ResumeProfile) => void;
}

export default function DataForm({ data, onChange }: DataFormProps) {
    const updateContact = (field: string, value: string) => {
        onChange({ ...data, contact: { ...data.contact, [field]: value } });
    };

    const updateSummary = (value: string) => {
        onChange({ ...data, summary: value });
    };

    return (
        <div className="p-6 space-y-8">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Profile Details</h2>

                <Accordion type="single" collapsible defaultValue="contact" className="w-full">
                    <AccordionItem value="contact">
                        <AccordionTrigger>Contact Information</AccordionTrigger>
                        <AccordionContent className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={data.contact.name} onChange={(e) => updateContact('name', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={data.contact.email} onChange={(e) => updateContact('email', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={data.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" value={data.contact.location || ''} onChange={(e) => updateContact('location', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input id="linkedin" value={data.contact.linkedin || ''} onChange={(e) => updateContact('linkedin', e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="summary">
                        <AccordionTrigger>Professional Summary</AccordionTrigger>
                        <AccordionContent className="py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="summary">Bio / Summary</Label>
                                <Textarea
                                    id="summary"
                                    className="min-h-[150px]"
                                    value={data.summary}
                                    onChange={(e) => updateSummary(e.target.value)}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="experience">
                        <AccordionTrigger>Work Experience ({data.experience.length})</AccordionTrigger>
                        <AccordionContent className="py-4">
                            <p className="text-sm text-gray-500">Edit feature coming soon (JSON Only for now)</p>
                            {/* Placeholder for array map editing */}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
