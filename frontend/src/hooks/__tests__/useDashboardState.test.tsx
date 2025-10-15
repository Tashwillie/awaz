import { renderHook, act, waitFor } from '@testing-library/react'
import { useDashboardState } from '../useDashboardState'
import { getDemoStatus } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

// Mock the API and auth functions
jest.mock('@/lib/api')
jest.mock('@/lib/auth')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}))

const mockGetDemoStatus = getDemoStatus as jest.MockedFunction<typeof getDemoStatus>
const mockIsAuthenticated = isAuthenticated as jest.MockedFunction<typeof isAuthenticated>

describe('useDashboardState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })
  })

  it('initializes with default state', () => {
    mockIsAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useDashboardState())
    
    expect(result.current.currentStep).toBe(2)
    expect(result.current.customizeState.currentStep).toBe(1)
    expect(result.current.customizeState.agentName).toBe('Funnder')
    expect(result.current.customizeState.backgroundNoise).toBe('Office')
  })

  it('loads session ID from localStorage', () => {
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('test-session-id'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    
    mockIsAuthenticated.mockReturnValue(true)
    
    renderHook(() => useDashboardState())
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('funnder_session_id')
  })

  it('handles localStorage errors gracefully', () => {
    const mockLocalStorage = {
      getItem: jest.fn().mockImplementation(() => {
        throw new Error('localStorage error')
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    
    mockIsAuthenticated.mockReturnValue(true)
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    renderHook(() => useDashboardState())
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load session ID:',
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })

  it('redirects to demo page when not authenticated', () => {
    const mockRouter = {
      replace: jest.fn(),
    }
    
    mockIsAuthenticated.mockReturnValue(false)
    
    // Mock useRouter to return our mock
    jest.doMock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }))
    
    renderHook(() => useDashboardState())
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/demo')
  })

  it('updates customize state correctly', () => {
    mockIsAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useDashboardState())
    
    act(() => {
      result.current.updateCustomizeState({ 
        agentName: 'New Agent Name' 
      })
    })
    
    expect(result.current.customizeState.agentName).toBe('New Agent Name')
  })

  it('handles multiple state updates', () => {
    mockIsAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useDashboardState())
    
    act(() => {
      result.current.updateCustomizeState({ 
        agentName: 'New Agent',
        backgroundNoise: 'Cafe'
      })
    })
    
    expect(result.current.customizeState.agentName).toBe('New Agent')
    expect(result.current.customizeState.backgroundNoise).toBe('Cafe')
  })

  it('fetches demo status when in launch step with session ID', async () => {
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('test-session-id'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    
    mockIsAuthenticated.mockReturnValue(true)
    mockGetDemoStatus.mockResolvedValue({
      status: 'READY',
      businessProfile: {
        business_profile: {
          name: 'Test Business',
        },
      },
    })
    
    const { result } = renderHook(() => useDashboardState())
    
    // Set to launch step
    act(() => {
      result.current.setCurrentStep(3)
    })
    
    await waitFor(() => {
      expect(mockGetDemoStatus).toHaveBeenCalledWith('test-session-id')
    })
    
    await waitFor(() => {
      expect(result.current.launchStatus.business).toBe('Test Business')
    })
  })

  it('does not fetch demo status when not in launch step', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    
    renderHook(() => useDashboardState())
    
    await waitFor(() => {
      expect(mockGetDemoStatus).not.toHaveBeenCalled()
    })
  })

  it('does not fetch demo status without session ID', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    
    const { result } = renderHook(() => useDashboardState())
    
    // Set to launch step but no session ID
    act(() => {
      result.current.setCurrentStep(3)
    })
    
    await waitFor(() => {
      expect(mockGetDemoStatus).not.toHaveBeenCalled()
    })
  })

  it('handles demo status fetch errors gracefully', async () => {
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('test-session-id'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    
    mockIsAuthenticated.mockReturnValue(true)
    mockGetDemoStatus.mockRejectedValue(new Error('API Error'))
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    const { result } = renderHook(() => useDashboardState())
    
    // Set to launch step
    act(() => {
      result.current.setCurrentStep(3)
    })
    
    await waitFor(() => {
      expect(mockGetDemoStatus).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch demo status:',
        expect.any(Error)
      )
    })
    
    consoleSpy.mockRestore()
  })

  it('opens training flow correctly', () => {
    mockIsAuthenticated.mockReturnValue(true)
    
    // Mock window.location
    delete window.location
    window.location = {
      href: 'http://localhost:3000/dashboard',
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    }
    
    const { result } = renderHook(() => useDashboardState())
    
    act(() => {
      result.current.handleOpenTrainingFlow()
    })
    
    expect(window.location.href).toBe('/demo')
  })

  it('sets up polling interval for demo status', async () => {
    jest.useFakeTimers()
    
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('test-session-id'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    
    mockIsAuthenticated.mockReturnValue(true)
    mockGetDemoStatus.mockResolvedValue({
      status: 'READY',
      businessProfile: {
        business_profile: {
          name: 'Test Business',
        },
      },
    })
    
    const { result } = renderHook(() => useDashboardState())
    
    // Set to launch step
    act(() => {
      result.current.setCurrentStep(3)
    })
    
    // Wait for initial call
    await waitFor(() => {
      expect(mockGetDemoStatus).toHaveBeenCalledTimes(1)
    })
    
    // Fast forward time to trigger interval
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    
    await waitFor(() => {
      expect(mockGetDemoStatus).toHaveBeenCalledTimes(2)
    })
    
    jest.useRealTimers()
  })

  it('cleans up interval on unmount', async () => {
    jest.useFakeTimers()
    
    const mockLocalStorage = {
      getItem: jest.fn().mockReturnValue('test-session-id'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    
    mockIsAuthenticated.mockReturnValue(true)
    mockGetDemoStatus.mockResolvedValue({
      status: 'READY',
      businessProfile: {
        business_profile: {
          name: 'Test Business',
        },
      },
    })
    
    const { result, unmount } = renderHook(() => useDashboardState())
    
    // Set to launch step
    act(() => {
      result.current.setCurrentStep(3)
    })
    
    // Wait for initial call
    await waitFor(() => {
      expect(mockGetDemoStatus).toHaveBeenCalledTimes(1)
    })
    
    // Unmount component
    unmount()
    
    // Fast forward time - should not trigger more calls
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    
    expect(mockGetDemoStatus).toHaveBeenCalledTimes(1)
    
    jest.useRealTimers()
  })
})
