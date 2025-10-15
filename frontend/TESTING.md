# Testing Guide

This document describes the testing setup and strategy for the Funnder frontend application.

## 🧪 Testing Infrastructure

### Dependencies
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: User interaction simulation

### Configuration Files
- `jest.config.js`: Jest configuration with Next.js integration
- `jest.setup.js`: Global test setup and mocks
- `src/test-utils/test-utils.tsx`: Custom testing utilities and helpers

## 📁 Test Structure

```
frontend/src/
├── components/
│   └── dashboard/
│       ├── __tests__/
│       │   ├── DashboardSidebar.test.tsx
│       │   ├── StepNavigation.test.tsx
│       │   └── TrainingStep.test.tsx
│       ├── customize/
│       │   └── __tests__/
│       │       ├── FaqsStep.test.tsx
│       │       └── AgentSettingsStep.test.tsx
│       └── launch/
│           └── __tests__/
│               └── LaunchHeader.test.tsx
├── hooks/
│   └── __tests__/
│       └── useDashboardState.test.tsx
├── app/
│   └── dashboard/
│       └── __tests__/
│           └── page.test.tsx
└── test-utils/
    ├── test-utils.tsx
    └── __mocks__/
        └── @testing-library/jest-dom.js
```

## 🎯 Testing Strategy

### Component Testing
Each component is tested with the following approach:

1. **Rendering Tests**: Verify components render without errors
2. **Props Testing**: Test component behavior with different props
3. **User Interaction**: Test button clicks, form inputs, etc.
4. **State Changes**: Test component state updates
5. **Styling**: Verify CSS classes are applied correctly
6. **Accessibility**: Test ARIA attributes and keyboard navigation

### Hook Testing
Custom hooks are tested using `renderHook` from React Testing Library:

1. **Initial State**: Verify default hook values
2. **State Updates**: Test state change functions
3. **Side Effects**: Test useEffect behaviors
4. **Error Handling**: Test error scenarios
5. **Cleanup**: Verify proper cleanup on unmount

### Integration Testing
Main page components test the integration of multiple components:

1. **Component Composition**: Verify components work together
2. **Props Passing**: Test data flow between components
3. **Navigation**: Test step transitions
4. **Mock Integration**: Test with mocked dependencies

## 🚀 Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test DashboardSidebar.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders"
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory and include:
- **Branches**: 70% threshold
- **Functions**: 70% threshold  
- **Lines**: 70% threshold
- **Statements**: 70% threshold

## 🛠️ Test Utilities

### Custom Render Function
```typescript
import { render } from '@/test-utils/test-utils'

// Automatically wraps components with providers
render(<MyComponent />)
```

### Mock Data Factories
```typescript
import { 
  createMockFaq, 
  createMockCustomizeState,
  createMockLaunchStatus 
} from '@/test-utils/test-utils'

const mockFaq = createMockFaq({ question: 'Custom question?' })
const mockState = createMockCustomizeState({ agentName: 'Custom Agent' })
```

### Mock Helpers
```typescript
import { mockLocalStorage } from '@/test-utils/test-utils'

const localStorageMock = mockLocalStorage()
localStorageMock.getItem.mockReturnValue('test-value')
```

## 🎭 Mocking Strategy

### External Dependencies
- **Next.js Router**: Mocked in `jest.setup.js`
- **API Calls**: Mocked using Jest mocks
- **localStorage**: Mocked for client-side storage testing
- **Window Objects**: Mocked for browser API testing

### Component Mocks
Components are mocked in integration tests to isolate functionality:
```typescript
jest.mock('@/components/dashboard/DashboardSidebar', () => {
  return function MockDashboardSidebar() {
    return <div data-testid="dashboard-sidebar">Dashboard Sidebar</div>
  }
})
```

## 📊 Test Examples

### Component Test Example
```typescript
describe('DashboardSidebar', () => {
  it('renders with default props', () => {
    render(<DashboardSidebar businessName="Test Business" />)
    
    expect(screen.getByText('Test Business')).toBeInTheDocument()
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument()
  })

  it('applies active styling to active navigation item', () => {
    const navItems = [
      { label: 'Active Item', href: '/active', isActive: true },
    ]
    
    render(<DashboardSidebar navigationItems={navItems} />)
    
    const activeItem = screen.getByText('Active Item').closest('a')
    expect(activeItem).toHaveClass('bg-gray-50', 'font-medium')
  })
})
```

### Hook Test Example
```typescript
describe('useDashboardState', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useDashboardState())
    
    expect(result.current.currentStep).toBe(2)
    expect(result.current.customizeState.agentName).toBe('Funnder')
  })

  it('updates customize state correctly', () => {
    const { result } = renderHook(() => useDashboardState())
    
    act(() => {
      result.current.updateCustomizeState({ agentName: 'New Agent' })
    })
    
    expect(result.current.customizeState.agentName).toBe('New Agent')
  })
})
```

## 🔧 Best Practices

### Test Naming
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Use `it` for individual test cases

### Test Organization
- One test file per component/hook
- Group tests by functionality
- Use `beforeEach` for common setup

### Assertions
- Use specific matchers (`toBeInTheDocument`, `toHaveClass`)
- Test user-visible behavior, not implementation details
- Verify both positive and negative cases

### Mocking
- Mock external dependencies, not internal implementation
- Use factory functions for test data
- Keep mocks simple and focused

## 🐛 Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async state updates
2. **Event Handlers**: Ensure proper event simulation
3. **CSS Classes**: Check for Tailwind class conflicts
4. **Mock Dependencies**: Verify mock implementations

### Debug Commands
```bash
# Run single test with verbose output
npm test -- --verbose DashboardSidebar.test.tsx

# Debug specific test
npm test -- --testNamePattern="renders with default props"

# Run tests with no coverage for faster debugging
npm test -- --coverage=false
```

## 📈 Continuous Integration

Tests are designed to run in CI environments with:
- Node.js 18+ support
- No browser dependencies
- Deterministic test results
- Proper cleanup after tests

## 🎯 Future Improvements

1. **E2E Testing**: Add Playwright for end-to-end tests
2. **Visual Testing**: Add screenshot testing for UI components
3. **Performance Testing**: Add performance benchmarks
4. **Accessibility Testing**: Add automated a11y testing
5. **Integration Testing**: Add API integration tests
