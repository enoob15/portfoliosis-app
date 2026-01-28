import { renderHook, act } from '@testing-library/react'
import { useManualPortfolio } from '../useManualPortfolio'
import { ManualPortfolioProvider } from '@/contexts/ManualPortfolioContext'
import { mockPortfolioData } from '@/lib/__tests__/test-utils'
import React from 'react'

describe('useManualPortfolio', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(ManualPortfolioProvider, {}, children)
  )

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('State Access', () => {
    it('should provide access to current step', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.currentStep).toBe('personal')
    })

    it('should provide access to data', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.updateData(mockPortfolioData)
      })

      expect(result.current.data).toEqual(mockPortfolioData)
    })

    it('should provide isDirty flag', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.isDirty).toBe(false)

      act(() => {
        result.current.updateField('summary', 'Test')
      })

      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('Navigation Helpers', () => {
    it('should navigate between steps', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.nextStep()
      })

      expect(result.current.currentStep).toBe('experience')

      act(() => {
        result.current.previousStep()
      })

      expect(result.current.currentStep).toBe('personal')
    })

    it('should provide canGoNext and canGoBack', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.canGoBack).toBe(false)
      expect(result.current.canGoNext).toBe(true)
    })
  })

  describe('Helper Functions', () => {
    it('should calculate current step index', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.getCurrentStepIndex()).toBe(0)

      act(() => {
        result.current.nextStep()
      })

      expect(result.current.getCurrentStepIndex()).toBe(1)
    })

    it('should calculate progress percentage', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      // First step (1/6 = 16.67%)
      expect(result.current.getProgress()).toBeCloseTo(16.67, 1)

      // Navigate to middle step (3/6 = 50%)
      act(() => {
        result.current.goToStep('education')
      })

      expect(result.current.getProgress()).toBe(50)

      // Last step (6/6 = 100%)
      act(() => {
        result.current.goToStep('review')
      })

      expect(result.current.getProgress()).toBe(100)
    })

    it('should check if step has data - personal', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.hasStepData('personal')).toBe(false)

      act(() => {
        result.current.updateField('personal', mockPortfolioData.personal)
      })

      expect(result.current.hasStepData('personal')).toBe(true)
    })

    it('should check if step has data - experience', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.hasStepData('experience')).toBe(false)

      act(() => {
        result.current.updateField('experience', [])
      })

      expect(result.current.hasStepData('experience')).toBe(false)

      act(() => {
        result.current.updateField('experience', mockPortfolioData.experience)
      })

      expect(result.current.hasStepData('experience')).toBe(true)
    })

    it('should check if step has data - education', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.hasStepData('education')).toBe(false)

      act(() => {
        result.current.updateField('education', mockPortfolioData.education)
      })

      expect(result.current.hasStepData('education')).toBe(true)
    })

    it('should check if step has data - skills', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.hasStepData('skills')).toBe(false)

      act(() => {
        result.current.updateField('skills', mockPortfolioData.skills)
      })

      expect(result.current.hasStepData('skills')).toBe(true)
    })

    it('should check if step has data - projects', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.hasStepData('projects')).toBe(false)

      act(() => {
        result.current.updateField('projects', mockPortfolioData.projects)
      })

      expect(result.current.hasStepData('projects')).toBe(true)
    })

    it('should return false for unknown step', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.hasStepData('unknown')).toBe(false)
    })
  })

  describe('Data Management', () => {
    it('should update single field', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Test summary')
      })

      expect(result.current.data.summary).toBe('Test summary')
    })

    it('should update multiple fields', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.updateData({
          personal: mockPortfolioData.personal,
          summary: mockPortfolioData.summary,
        })
      })

      expect(result.current.data.personal).toEqual(mockPortfolioData.personal)
      expect(result.current.data.summary).toBe(mockPortfolioData.summary)
    })
  })

  describe('Draft Operations', () => {
    it('should save draft', async () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Test')
      })

      await act(async () => {
        await result.current.saveDraft()
      })

      expect(result.current.isDirty).toBe(false)
      expect(result.current.lastSaved).not.toBeNull()
    })

    it('should load draft', () => {
      const draftData = {
        data: mockPortfolioData,
        draftId: 'draft_123',
        timestamp: new Date().toISOString(),
      }

      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(draftData))

      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.loadDraft()
      })

      expect(result.current.data).toEqual(mockPortfolioData)
      expect(result.current.draftId).toBe('draft_123')
    })

    it('should reset all state', () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.updateData(mockPortfolioData)
        result.current.nextStep()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.currentStep).toBe('personal')
      expect(result.current.data).toEqual({})
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('Saving State', () => {
    it('should provide isSaving flag', async () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      act(() => {
        result.current.updateField('summary', 'Test')
      })

      expect(result.current.isSaving).toBe(false)

      const savePromise = act(async () => {
        await result.current.saveDraft()
      })

      await savePromise

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('Last Saved Timestamp', () => {
    it('should track last saved time', async () => {
      const { result } = renderHook(() => useManualPortfolio(), { wrapper })

      expect(result.current.lastSaved).toBeNull()

      act(() => {
        result.current.updateField('summary', 'Test')
      })

      await act(async () => {
        await result.current.saveDraft()
      })

      expect(result.current.lastSaved).toBeInstanceOf(Date)
    })
  })
})
