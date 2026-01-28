'use client';

import { useState } from 'react';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { FormField } from '../shared/FormField';
import { AIAssistButton } from '../shared/AIAssistButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Skill } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

const SKILL_CATEGORIES = [
  { value: 'technical', label: 'Technical' },
  { value: 'soft', label: 'Soft Skill' },
  { value: 'language', label: 'Language' },
  { value: 'tool', label: 'Tool' },
  { value: 'framework', label: 'Framework' }
];

export default function SkillsStep() {
  const { data, updateField } = useManualPortfolio();
  const [skills, setSkills] = useState<Skill[]>(
    data.skills || []
  );

  const handleAdd = () => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: '',
      category: 'technical',
      proficiency: 'intermediate'
    };
    const updated = [...skills, newSkill];
    setSkills(updated);
    updateField('skills', updated);
  };

  const handleRemove = (id: string) => {
    const updated = skills.filter((skill) => skill.id !== id);
    setSkills(updated);
    updateField('skills', updated);
  };

  const handleUpdate = (id: string, field: keyof Skill, value: any) => {
    const updated = skills.map((skill) =>
      skill.id === id ? { ...skill, [field]: value } : skill
    );
    setSkills(updated);
    updateField('skills', updated);
  };

  const handleAISuggest = (suggestion: any) => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: suggestion.name,
      category: suggestion.category,
      proficiency: 'intermediate'
    };
    const updated = [...skills, newSkill];
    setSkills(updated);
    updateField('skills', updated);
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Skills</h2>
          {data.experience && data.experience.length > 0 && (
            <AIAssistButton
              type="skills"
              input={{
                experiences: data.experience.map((exp) => ({
                  position: exp.position,
                  description: exp.description
                })),
                existingSkills: skills.map((s) => s.name)
              }}
              onSelect={handleAISuggest}
              label="Suggest Skills"
            />
          )}
        </div>
        <p className="text-gray-600">Add your technical and soft skills.</p>
      </div>

      {/* Skill Input */}
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.id} className="flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={skill.name}
                onChange={(e) => handleUpdate(skill.id, 'name', e.target.value)}
                placeholder="Skill name"
              />

              <Select
                value={skill.category}
                onValueChange={(value: any) => handleUpdate(skill.id, 'category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={skill.proficiency}
                onValueChange={(value: any) => handleUpdate(skill.id, 'proficiency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(skill.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button onClick={handleAdd} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Grouped Skills Preview */}
      {Object.keys(groupedSkills).length > 0 && (
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Skills by Category</h3>
          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {category} ({categorySkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
