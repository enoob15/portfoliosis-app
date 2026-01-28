'use client';

import { useState } from 'react';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { FormField } from '../shared/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Education } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

export default function EducationStep() {
  const { data, updateField } = useManualPortfolio();
  const [education, setEducation] = useState<Education[]>(
    data.education || [
      {
        id: uuidv4(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        honors: [],
        description: ''
      }
    ]
  );

  const handleAdd = () => {
    const newEdu: Education = {
      id: uuidv4(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: [],
      description: ''
    };
    const updated = [...education, newEdu];
    setEducation(updated);
    updateField('education', updated);
  };

  const handleRemove = (id: string) => {
    const updated = education.filter((edu) => edu.id !== id);
    setEducation(updated);
    updateField('education', updated);
  };

  const handleUpdate = (id: string, field: keyof Education, value: any) => {
    const updated = education.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducation(updated);
    updateField('education', updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Education</h2>
        <p className="text-gray-600">Add your academic background and qualifications.</p>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Education #{index + 1}</h3>
            {education.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(edu.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Institution" required>
              <Input
                value={edu.institution}
                onChange={(e) => handleUpdate(edu.id, 'institution', e.target.value)}
                placeholder="University Name"
              />
            </FormField>

            <FormField label="Degree" required>
              <Input
                value={edu.degree}
                onChange={(e) => handleUpdate(edu.id, 'degree', e.target.value)}
                placeholder="Bachelor's, Master's, etc."
              />
            </FormField>

            <FormField label="Field of Study" required>
              <Input
                value={edu.field}
                onChange={(e) => handleUpdate(edu.id, 'field', e.target.value)}
                placeholder="Computer Science"
              />
            </FormField>

            <FormField label="GPA">
              <Input
                value={edu.gpa}
                onChange={(e) => handleUpdate(edu.id, 'gpa', e.target.value)}
                placeholder="3.8/4.0"
              />
            </FormField>

            <FormField label="Start Date" required>
              <Input
                type="month"
                value={edu.startDate}
                onChange={(e) => handleUpdate(edu.id, 'startDate', e.target.value)}
              />
            </FormField>

            <FormField label="End Date" required>
              <Input
                type="month"
                value={edu.endDate}
                onChange={(e) => handleUpdate(edu.id, 'endDate', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              value={edu.description}
              onChange={(e) => handleUpdate(edu.id, 'description', e.target.value)}
              rows={2}
              placeholder="Optional: Add relevant coursework, thesis, etc."
            />
          </FormField>
        </div>
      ))}

      <Button onClick={handleAdd} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Education
      </Button>
    </div>
  );
}
