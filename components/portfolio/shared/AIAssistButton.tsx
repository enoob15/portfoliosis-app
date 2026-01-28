'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAIAssist, type AIContentType } from '@/hooks/useAIAssist';
import { toast } from 'sonner';

interface AIAssistButtonProps {
  type: AIContentType;
  input: any;
  onSelect: (content: any) => void;
  label?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function AIAssistButton({
  type,
  input,
  onSelect,
  label = 'AI Assist',
  size = 'sm',
  variant = 'outline'
}: AIAssistButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const { generate, generating, result } = useAIAssist({
    onSuccess: () => {
      // Modal will show the result
    },
    onError: (error) => {
      toast.error(error);
      setOpen(false);
    }
  });

  const handleGenerate = async () => {
    setOpen(true);
    await generate(type, input);
  };

  const handleUseContent = (content: any) => {
    onSelect(content);
    setOpen(false);
    toast.success('Content applied successfully');
  };

  const renderResult = () => {
    if (!result) return null;

    switch (type) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Professional</span>
                <Button size="sm" onClick={() => handleUseContent(result.professional)}>
                  Use This
                </Button>
              </div>
              <p className="text-sm text-gray-700">{result.professional}</p>
            </div>

            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Conversational</span>
                <Button size="sm" onClick={() => handleUseContent(result.conversational)}>
                  Use This
                </Button>
              </div>
              <p className="text-sm text-gray-700">{result.conversational}</p>
            </div>

            <div className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Creative</span>
                <Button size="sm" onClick={() => handleUseContent(result.creative)}>
                  Use This
                </Button>
              </div>
              <p className="text-sm text-gray-700">{result.creative}</p>
            </div>
          </div>
        );

      case 'experience':
      case 'project':
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Enhanced Description</h4>
              <p className="text-sm text-gray-700 mb-4">
                {result.enhancedDescription || result.description}
              </p>

              <h4 className="font-medium mb-2">Key Highlights</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.highlights?.map((highlight: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700">
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <Button onClick={() => handleUseContent(result)}>
                  Use This Content
                </Button>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-2">
            {result.suggestions?.map((skill: any, index: number) => (
              <div
                key={index}
                className="p-3 border rounded-lg flex items-center justify-between hover:border-primary cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({skill.category})</span>
                </div>
                <Button size="sm" onClick={() => handleUseContent(skill)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        );

      case 'rewrite':
        return (
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-700 mb-4">{result.rewritten}</p>
            <Button onClick={() => handleUseContent(result.rewritten)}>
              Use Rewritten Version
            </Button>
          </div>
        );

      default:
        return <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI-Generated Content</DialogTitle>
            <DialogDescription>
              Choose the version you like best or regenerate for more options.
            </DialogDescription>
          </DialogHeader>

          {generating && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-gray-500">Generating content...</p>
              </div>
            </div>
          )}

          {!generating && result && renderResult()}

          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-gray-500">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Powered by AI
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleGenerate} disabled={generating}>
                Regenerate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
