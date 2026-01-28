'use client';

import { useState } from 'react';
import { useManualPortfolio } from '@/hooks/useManualPortfolio';
import { useAuth } from '@/hooks/useAuth';
import { FormField } from '../shared/FormField';
import { AIAssistButton } from '../shared/AIAssistButton';
import { ImageUploader } from '../shared/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { Project } from '@/types/profile';
import { v4 as uuidv4 } from 'uuid';

export default function ProjectsStep() {
  const { data, updateField } = useManualPortfolio();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(
    data.projects || []
  );

  const handleAdd = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      github: '',
      image: '',
      highlights: [''],
      startDate: '',
      endDate: ''
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleRemove = (id: string) => {
    const updated = projects.filter((proj) => proj.id !== id);
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleUpdate = (id: string, field: keyof Project, value: any) => {
    const updated = projects.map((proj) =>
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleAddHighlight = (projId: string) => {
    const updated = projects.map((proj) =>
      proj.id === projId
        ? { ...proj, highlights: [...proj.highlights, ''] }
        : proj
    );
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleUpdateHighlight = (projId: string, index: number, value: string) => {
    const updated = projects.map((proj) =>
      proj.id === projId
        ? {
            ...proj,
            highlights: proj.highlights.map((h, i) => (i === index ? value : h))
          }
        : proj
    );
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleRemoveHighlight = (projId: string, index: number) => {
    const updated = projects.map((proj) =>
      proj.id === projId
        ? {
            ...proj,
            highlights: proj.highlights.filter((_, i) => i !== index)
          }
        : proj
    );
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleAIGenerate = (projId: string, aiResult: any) => {
    const updated = projects.map((proj) =>
      proj.id === projId
        ? {
            ...proj,
            description: aiResult.description,
            highlights: aiResult.highlights
          }
        : proj
    );
    setProjects(updated);
    updateField('projects', updated);
  };

  const handleTechnologiesChange = (projId: string, value: string) => {
    // Convert comma-separated string to array
    const techArray = value.split(',').map((t) => t.trim()).filter((t) => t);
    handleUpdate(projId, 'technologies', techArray);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Projects</h2>
        <p className="text-gray-600">
          Showcase your best work. Projects are optional but highly recommended.
        </p>
      </div>

      {projects.map((project, index) => (
        <div key={project.id} className="border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project #{index + 1}</h3>
            <div className="flex items-center gap-2">
              {project.name && project.description && project.technologies.length > 0 && (
                <AIAssistButton
                  type="project"
                  input={{
                    name: project.name,
                    technologies: project.technologies,
                    basicDescription: project.description
                  }}
                  onSelect={(result) => handleAIGenerate(project.id, result)}
                  label="Enhance with AI"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(project.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Project Image */}
          {user && (
            <div>
              <label className="text-sm font-medium mb-2 block">Project Image</label>
              <ImageUploader
                userId={user.id}
                category="project"
                aspectRatio={16 / 9}
                onUpload={(url) => handleUpdate(project.id, 'image', url)}
                currentImage={project.image}
                className="max-w-md"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Project Name" required>
              <Input
                value={project.name}
                onChange={(e) => handleUpdate(project.id, 'name', e.target.value)}
                placeholder="My Awesome Project"
              />
            </FormField>

            <FormField label="Technologies" required hint="Comma-separated list">
              <Input
                value={project.technologies.join(', ')}
                onChange={(e) => handleTechnologiesChange(project.id, e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
            </FormField>

            <FormField label="Live URL">
              <div className="flex gap-2">
                <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                <Input
                  type="url"
                  value={project.url}
                  onChange={(e) => handleUpdate(project.id, 'url', e.target.value)}
                  placeholder="https://project.com"
                />
              </div>
            </FormField>

            <FormField label="GitHub URL">
              <div className="flex gap-2">
                <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                <Input
                  type="url"
                  value={project.github}
                  onChange={(e) => handleUpdate(project.id, 'github', e.target.value)}
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </FormField>
          </div>

          <FormField label="Description" required>
            <Textarea
              value={project.description}
              onChange={(e) => handleUpdate(project.id, 'description', e.target.value)}
              rows={3}
              placeholder="Describe what the project does and your role..."
            />
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Key Features/Highlights</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddHighlight(project.id)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Highlight
              </Button>
            </div>

            <div className="space-y-2">
              {project.highlights.map((highlight, hIndex) => (
                <div key={hIndex} className="flex gap-2">
                  <Input
                    value={highlight}
                    onChange={(e) =>
                      handleUpdateHighlight(project.id, hIndex, e.target.value)
                    }
                    placeholder="Key feature or achievement"
                  />
                  {project.highlights.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHighlight(project.id, hIndex)}
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

      <Button onClick={handleAdd} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
}
