import { useManualPortfolioContext } from '@/contexts/ManualPortfolioContext';
import { useCallback } from 'react';

/**
 * Custom hook for managing manual portfolio creation
 * Provides simplified API for components to interact with portfolio state
 */
export function useManualPortfolio() {
  const context = useManualPortfolioContext();

  const {
    state,
    goToStep,
    nextStep,
    previousStep,
    updateField,
    updateData,
    saveDraft,
    loadDraft,
    reset,
    canGoNext,
    canGoBack
  } = context;

  // Helper to get current step index
  const getCurrentStepIndex = useCallback(() => {
    const steps = ['personal', 'experience', 'education', 'skills', 'projects', 'review'];
    return steps.indexOf(state.currentStep);
  }, [state.currentStep]);

  // Helper to get progress percentage
  const getProgress = useCallback(() => {
    const steps = ['personal', 'experience', 'education', 'skills', 'projects', 'review'];
    const currentIndex = steps.indexOf(state.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  }, [state.currentStep]);

  // Helper to check if step has data
  const hasStepData = useCallback((step: string) => {
    switch (step) {
      case 'personal':
        return !!state.data.personal;
      case 'experience':
        return !!state.data.experience && state.data.experience.length > 0;
      case 'education':
        return !!state.data.education && state.data.education.length > 0;
      case 'skills':
        return !!state.data.skills && state.data.skills.length > 0;
      case 'projects':
        return !!state.data.projects && state.data.projects.length > 0;
      default:
        return false;
    }
  }, [state.data]);

  return {
    // State
    currentStep: state.currentStep,
    data: state.data,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    draftId: state.draftId,

    // Navigation
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoBack,

    // Data management
    updateField,
    updateData,
    saveDraft,
    loadDraft,
    reset,

    // Helpers
    getCurrentStepIndex,
    getProgress,
    hasStepData
  };
}
