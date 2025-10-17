import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockFaq = (overrides = {}) => ({
  id: 'test-faq-id',
  question: 'Test question?',
  answer: 'Test answer',
  ...overrides,
})

export const createMockCustomizeState = (overrides = {}) => ({
  currentStep: 1,
  faqs: [],
  editingFaqs: true,
  agentName: 'Test Agent',
  backgroundNoise: 'Office',
  editingAgent: true,
  greeting: 'Hello, this is a test greeting.',
  includeRecordingDisclaimer: true,
  editingGreeting: true,
  customQuestions: [],
  editingCustomQs: true,
  ...overrides,
})

export const createMockLaunchStatus = (overrides = {}) => ({
  minutesLeft: 25,
  business: 'Test Business',
  ...overrides,
})

// Mock API responses
export const createMockDemoStatus = (overrides = {}) => ({
  status: 'READY',
  callStatus: 'COMPLETED',
  businessProfile: {
    business_profile: {
      name: 'Test Business',
      brand_voice: 'Professional',
      services: ['Service 1', 'Service 2'],
    },
  },
  call: {
    id: 'test-call-id',
    status: 'COMPLETED',
    provider: 'awaz',
    providerCallId: 'awaz-123',
  },
  ...overrides,
})

// Test helpers
export const waitForLoadingToFinish = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })
  return localStorageMock
}
