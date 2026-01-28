import { useState, useCallback } from 'react';
import { generatePortfolioContent } from '@/app/actions/manual-portfolio';
import { toast } from 'sonner';

export type AIContentType = 'summary' | 'experience' | 'project' | 'skills' | 'rewrite';

export interface UseAIAssistOptions {
  onSuccess?: (content: any) => void;
  onError?: (error: string) => void;
}

export function useAIAssist(options: UseAIAssistOptions = {}) {
  const { onSuccess, onError } = options;

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const generate = useCallback(
    async (type: AIContentType, input: any) => {
      setGenerating(true);
      setError(null);
      setResult(null);

      try {
        const generatedContent = await generatePortfolioContent(type, input);
        setResult(generatedContent);

        if (onSuccess) {
          onSuccess(generatedContent);
        }

        return generatedContent;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
        setError(errorMessage);
        toast.error(errorMessage);

        if (onError) {
          onError(errorMessage);
        }

        throw err;
      } finally {
        setGenerating(false);
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    generate,
    reset,
    generating,
    error,
    result
  };
}
