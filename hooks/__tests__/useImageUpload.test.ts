import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageUpload } from '../useImageUpload'
import * as imageUploadLib from '@/lib/storage/image-upload'
import { toast } from 'sonner'
import { createMockFile } from '@/lib/__tests__/test-utils'

jest.mock('@/lib/storage/image-upload')
jest.mock('sonner')

describe('useImageUpload', () => {
  const mockUserId = 'user-123'
  const mockOptions = {
    userId: mockUserId,
    category: 'profile' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useImageUpload(mockOptions))

      expect(result.current.uploading).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.imageUrl).toBeNull()
      expect(result.current.imagePath).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('Upload', () => {
    it('should upload image successfully', async () => {
      const mockFile = createMockFile()
      const mockResult = {
        path: 'uploads/profile/test.jpg',
        publicUrl: 'https://example.com/test.jpg',
      }

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockResolvedValue(mockResult)

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        await result.current.upload(mockFile)
      })

      expect(result.current.uploading).toBe(false)
      expect(result.current.imageUrl).toBe(mockResult.publicUrl)
      expect(result.current.imagePath).toBe(mockResult.path)
      expect(result.current.error).toBeNull()
      expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully')
    })

    it('should set uploading state during upload', async () => {
      const mockFile = createMockFile()

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockImplementation(() =>
        new Promise((resolve) => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useImageUpload(mockOptions))

      act(() => {
        result.current.upload(mockFile)
      })

      expect(result.current.uploading).toBe(true)
    })

    it('should track upload progress', async () => {
      const mockFile = createMockFile()
      let progressCallback: ((progress: number) => void) | null = null

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockImplementation(({ onProgress }) => {
        progressCallback = onProgress || null
        return Promise.resolve({
          path: 'test.jpg',
          publicUrl: 'https://example.com/test.jpg',
        })
      })

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        const uploadPromise = result.current.upload(mockFile)

        // Simulate progress updates
        if (progressCallback) {
          act(() => {
            progressCallback!(50)
          })
        }

        await uploadPromise
      })

      expect(result.current.progress).toBeGreaterThan(0)
    })

    it('should handle validation error', async () => {
      const mockFile = createMockFile()

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({
        valid: false,
        error: 'File too large',
      })

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        try {
          await result.current.upload(mockFile)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('File too large')
      expect(result.current.uploading).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('File too large')
    })

    it('should handle upload error', async () => {
      const mockFile = createMockFile()
      const mockError = new Error('Upload failed')

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockRejectedValue(mockError)

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        try {
          await result.current.upload(mockFile)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Upload failed')
      expect(result.current.uploading).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Upload failed')
    })

    it('should call onSuccess callback', async () => {
      const mockFile = createMockFile()
      const mockResult = {
        path: 'test.jpg',
        publicUrl: 'https://example.com/test.jpg',
      }
      const onSuccess = jest.fn()

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockResolvedValue(mockResult)

      const { result } = renderHook(() =>
        useImageUpload({ ...mockOptions, onSuccess })
      )

      await act(async () => {
        await result.current.upload(mockFile)
      })

      expect(onSuccess).toHaveBeenCalledWith(mockResult.publicUrl)
    })

    it('should call onError callback', async () => {
      const mockFile = createMockFile()
      const onError = jest.fn()

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({
        valid: false,
        error: 'Invalid file',
      })

      const { result } = renderHook(() =>
        useImageUpload({ ...mockOptions, onError })
      )

      await act(async () => {
        try {
          await result.current.upload(mockFile)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(onError).toHaveBeenCalledWith('Invalid file')
    })
  })

  describe('Remove', () => {
    it('should remove image successfully', async () => {
      const mockFile = createMockFile()
      const mockResult = {
        path: 'test.jpg',
        publicUrl: 'https://example.com/test.jpg',
      }

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockResolvedValue(mockResult)
      jest.spyOn(imageUploadLib, 'deleteImage').mockResolvedValue()

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        await result.current.upload(mockFile)
      })

      expect(result.current.imageUrl).not.toBeNull()

      await act(async () => {
        await result.current.remove()
      })

      expect(result.current.imageUrl).toBeNull()
      expect(result.current.imagePath).toBeNull()
      expect(toast.success).toHaveBeenCalledWith('Image removed successfully')
    })

    it('should handle remove when no image exists', async () => {
      jest.spyOn(imageUploadLib, 'deleteImage').mockResolvedValue()

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        await result.current.remove()
      })

      expect(imageUploadLib.deleteImage).not.toHaveBeenCalled()
    })

    it('should handle remove error', async () => {
      const mockFile = createMockFile()
      const mockResult = {
        path: 'test.jpg',
        publicUrl: 'https://example.com/test.jpg',
      }
      const mockError = new Error('Delete failed')

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockResolvedValue(mockResult)
      jest.spyOn(imageUploadLib, 'deleteImage').mockRejectedValue(mockError)

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        await result.current.upload(mockFile)
      })

      await act(async () => {
        try {
          await result.current.remove()
        } catch (error) {
          // Expected to throw
        }
      })

      expect(toast.error).toHaveBeenCalledWith('Delete failed')
    })
  })

  describe('Update', () => {
    it('should update image successfully', async () => {
      const oldFile = createMockFile('old.jpg')
      const newFile = createMockFile('new.jpg')
      const oldResult = {
        path: 'old.jpg',
        publicUrl: 'https://example.com/old.jpg',
      }
      const newResult = {
        path: 'new.jpg',
        publicUrl: 'https://example.com/new.jpg',
      }

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockResolvedValue(oldResult)
      jest.spyOn(imageUploadLib, 'updateImage').mockResolvedValue(newResult)

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        await result.current.upload(oldFile)
      })

      expect(result.current.imageUrl).toBe(oldResult.publicUrl)

      await act(async () => {
        await result.current.update(newFile)
      })

      expect(result.current.imageUrl).toBe(newResult.publicUrl)
      expect(result.current.imagePath).toBe(newResult.path)
      expect(toast.success).toHaveBeenCalledWith('Image updated successfully')
    })

    it('should handle update validation error', async () => {
      const newFile = createMockFile('new.jpg')

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({
        valid: false,
        error: 'Invalid file type',
      })

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        try {
          await result.current.update(newFile)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Invalid file type')
      expect(toast.error).toHaveBeenCalledWith('Invalid file type')
    })
  })

  describe('Reset', () => {
    it('should reset all state', async () => {
      const mockFile = createMockFile()
      const mockResult = {
        path: 'test.jpg',
        publicUrl: 'https://example.com/test.jpg',
      }

      jest.spyOn(imageUploadLib, 'validateImageFile').mockReturnValue({ valid: true })
      jest.spyOn(imageUploadLib, 'uploadImage').mockResolvedValue(mockResult)

      const { result } = renderHook(() => useImageUpload(mockOptions))

      await act(async () => {
        await result.current.upload(mockFile)
      })

      expect(result.current.imageUrl).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.uploading).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.imageUrl).toBeNull()
      expect(result.current.imagePath).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})
