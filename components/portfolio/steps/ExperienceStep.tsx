'use client';

import { useState } from 'react';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { FormField } from '../shared/FormField';
import { AIAssistButton } from '../shared/AIAssistButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Experience } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

export default function ExperienceStep() {
  const { data, updateField } = useManualPortfolio();
  const [experiences, setExperiences] = useState<Experience[]>(
    data.experience || [
      {
        id: uuidv4(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        highlights: [''],
        technologies: []
      }
    ]
  );

  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: uuidv4(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: [''],
      technologies: []
    };
    const updated = [...experiences, newExperience];
    setExperiences(updated);
    updateField('experience', updated);
  };

  const handleRemoveExperience = (id: string) => {
    const updated = experiences.filter((exp) => exp.id !== id);
    setExperiences(updated);
    updateField('experience', updated);
  };

  const handleUpdateExperience = (id: string, field: keyof Experience, value: any) => {
    const updated = experiences.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setExperiences(updated);
    updateField('experience', updated);
  };

  const handleAddHighlight = (expId: string) => {
    const updated = experiences.map((exp) =>
      exp.id === expId
        ? { ...exp, highlights: [...exp.highlights, ''] }
        : exp
    );
    setExperiences(updated);
    updateField('experience', updated);
  };

  const handleUpdateHighlight = (expId: string, index: number, value: string) => {
    const updated = experiences.map((exp) =>
      exp.id === expId
        ? {
            ...exp,
            highlights: exp.highlights.map((h, i) => (i === index ? value : h))
          }
        : exp
    );
    setExperiences(updated);
    updateField('experience', updated);
  };

  const handleRemoveHighlight = (expId: string, index: number) => {
    const updated = experiences.map((exp) =>
      exp.id === expId
        ? {
            ...exp,
            highlights: exp.highlights.filter((_, i) => i !== index)
          }
        : exp
    );
    setExperiences(updated);
    updateField('experience', updated);
  };

  const handleAIEnhance = (expId: string, aiResult: any) => {
    const updated = experiences.map((exp) =>
      exp.id === expId
        ? {
            ...exp,
            description: aiResult.enhancedDescription,
            highlights: aiResult.highlights
          }
        : exp
    );
    setExperiences(updated);
    updateField('experience', updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
        <p className="text-gray-600">
          Add your work experience. Include key achievements and responsibilities.
        </p>
      </div>

      {experiences.map((experience, index) => (
        <div key={experience.id} className="border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold">
                Experience #{index + 1}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {experience.company && experience.position && experience.description && (
                <AIAssistButton
                  type="experience"
                  input={{
                    company: experience.company,
                    position: experience.position,
                    description: experience.description,
                    technologies: experience.technologies
                  }}
                  onSelect={(result) => handleAIEnhance(experience.id, result)}
                  label="Enhance with AI"
                />
              )}
              {experiences.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExperience(experience.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Company" required>
              <Input
                value={experience.company}
                onChange={(e) =>
                  handleUpdateExperience(experience.id, 'company', e.target.value)
                }
                placeholder="Company Name"
              />
            </FormField>

            <FormField label="Position" required>
              <Input
                value={experience.position}
                onChange={(e) =>
                  handleUpdateExperience(experience.id, 'position', e.target.value)
                }
                placeholder="Job Title"
              />
            </FormField>

            <FormField label="Location">
              <Input
                value={experience.location}
                onChange={(e) =>
                  handleUpdateExperience(experience.id, 'location', e.target.value)
                }
                placeholder="City, Country"
              />
            </FormField>

            <FormField label="Start Date" required>
              <Input
                type="month"
                value={experience.startDate}
                onChange={(e) =>
                  handleUpdateExperience(experience.id, 'startDate', e.target.value)
                }
              />
            </FormField>

            <FormField label="End Date" hint="Leave empty if current">
              <Input
                type="month"
                value={experience.endDate}
                onChange={(e) =>
                  handleUpdateExperience(experience.id, 'endDate', e.target.value)
                }
              />
            </FormField>
          </div>

          <FormField label="Description" required>
            <Textarea
              value={experience.description}
              onChange={(e) =>
                handleUpdateExperience(experience.id, 'description', e.target.value)
              }
              rows={3}
              placeholder="Describe your role and responsibilities..."
            />
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Key Achievements</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddHighlight(experience.id)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Highlight
              </Button>
            </div>

            <div className="space-y-2">
              {experience.highlights.map((highlight, hIndex) => (
                <div key={hIndex} className="flex gap-2">
                  <Input
                    value={highlight}
                    onChange={(e) =>
                      handleUpdateHighlight(experience.id, hIndex, e.target.value)
                    }
                    placeholder="Key achievement or responsibility"
                  />
                  {experience.highlights.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHighlight(experience.id, hIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <Button onClick={handleAddExperience} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Experience
      </Button>
    </div>
  );
}
