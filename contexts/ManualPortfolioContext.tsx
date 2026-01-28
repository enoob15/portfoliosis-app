'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { ParsedResume } from '@/types/profile';

// Auto-save interval (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;
const STORAGE_KEY = 'portfoliosis_manual_draft';

export type ManualPortfolioStep =
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'review';

export interface ManualPortfolioState {
  currentStep: ManualPortfolioStep;
  data: Partial<ParsedResume>;
  isDirty: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  draftId: string | null;
}

type ManualPortfolioAction =
  | { type: 'SET_STEP'; step: ManualPortfolioStep }
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'UPDATE_DATA'; data: Partial<ParsedResume> }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; draftId: string }
  | { type: 'SAVE_ERROR' }
  | { type: 'LOAD_DRAFT'; data: Partial<ParsedResume>; draftId: string }
  | { type: 'RESET' };

interface ManualPortfolioContextValue {
  state: ManualPortfolioState;
  goToStep: (step: ManualPortfolioStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateField: (field: string, value: any) => void;
  updateData: (data: Partial<ParsedResume>) => void;
  saveDraft: () => Promise<void>;
  loadDraft: () => void;
  reset: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
}

const ManualPortfolioContext = createContext<ManualPortfolioContextValue | undefined>(undefined);

const STEPS: ManualPortfolioStep[] = [
  'personal',
  'experience',
  'education',
  'skills',
  'projects',
  'review'
];

function manualPortfolioReducer(
  state: ManualPortfolioState,
  action: ManualPortfolioAction
): ManualPortfolioState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'UPDATE_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value
        },
        isDirty: true
      };

    case 'UPDATE_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data
        },
        isDirty: true
      };

    case 'SAVE_START':
      return { ...state, isSaving: true };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaving: false,
        isDirty: false,
        lastSaved: new Date(),
        draftId: action.draftId
      };

    case 'SAVE_ERROR':
      return { ...state, isSaving: false };

    case 'LOAD_DRAFT':
      return {
        ...state,
        data: action.data,
        draftId: action.draftId,
        isDirty: false,
        lastSaved: new Date()
      };

    case 'RESET':
      return {
        currentStep: 'personal',
        data: {},
        isDirty: false,
        lastSaved: null,
        isSaving: false,
        draftId: null
      };

    default:
      return state;
  }
}

export function ManualPortfolioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(manualPortfolioReducer, {
    currentStep: 'personal',
    data: {},
    isDirty: false,
    lastSaved: null,
    isSaving: false,
    draftId: null
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: state.data,
        draftId: state.draftId,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [state.data, state.draftId]);

  // Load from localStorage
  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { data, draftId } = JSON.parse(stored);
        dispatch({ type: 'LOAD_DRAFT', data, draftId });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  // Save draft to server
  const saveDraft = useCallback(async () => {
    if (!state.isDirty) return;

    dispatch({ type: 'SAVE_START' });

    try {
      // TODO: Implement server action to save draft
      // const response = await saveManualPortfolioDraft(state.data, state.draftId);

      // Simulate save for now
      const draftId = state.draftId || `draft_${Date.now()}`;

      // Save to localStorage as backup
      saveToLocalStorage();

      dispatch({ type: 'SAVE_SUCCESS', draftId });
    } catch (error) {
      console.error('Failed to save draft:', error);
      dispatch({ type: 'SAVE_ERROR' });
    }
  }, [state.data, state.draftId, state.isDirty, saveToLocalStorage]);

  // Auto-save effect
  useEffect(() => {
    if (state.isDirty) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_INTERVAL);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [state.isDirty, saveDraft]);

  // Save to localStorage on data change
  useEffect(() => {
    if (state.data && Object.keys(state.data).length > 0) {
      saveToLocalStorage();
    }
  }, [state.data, saveToLocalStorage]);

  // Browser back button warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // Some browsers display this message
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.isDirty]);

  // Navigation helpers
  const goToStep = useCallback((step: ManualPortfolioStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex < STEPS.length - 1) {
      dispatch({ type: 'SET_STEP', step: STEPS[currentIndex + 1] });
      // Trigger save when moving between steps
      saveDraft();
    }
  }, [state.currentStep, saveDraft]);

  const previousStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.currentStep);
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', step: STEPS[currentIndex - 1] });
    }
  }, [state.currentStep]);

  const updateField = useCallback((field: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const updateData = useCallback((data: Partial<ParsedResume>) => {
    dispatch({ type: 'UPDATE_DATA', data });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  const currentIndex = STEPS.indexOf(state.currentStep);
  const canGoNext = currentIndex < STEPS.length - 1;
  const canGoBack = currentIndex > 0;

  const value: ManualPortfolioContextValue = {
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
  };

  return (
    <ManualPortfolioContext.Provider value={value}>
      {children}
    </ManualPortfolioContext.Provider>
  );
}

export function useManualPortfolioContext() {
  const context = useContext(ManualPortfolioContext);
  if (context === undefined) {
    throw new Error('useManualPortfolioContext must be used within ManualPortfolioProvider');
  }
  return context;
}
