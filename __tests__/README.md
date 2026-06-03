# Test Suite Documentation

This directory contains comprehensive unit and integration tests for the StockFlow retail management system, with special focus on the ModernCreateItemForm component and surgical fixes following Karpathy Skills principles.

## Test Structure

```
__tests__/
├── components/
│   └── inventory/
│       ├── ModernCreateItemForm.test.tsx              # Core component tests
│       ├── ModernCreateItemForm.navigation.test.tsx   # Step navigation tests
│       ├── ModernCreateItemForm.persistence.test.tsx  # Data persistence tests
│       └── ModernCreateItemForm.surgical-fixes.test.tsx # Surgical fixes tests
├── actions/
│   └── item/
│       └── createItemAction.test.ts                   # Server action tests
├── hooks/
│   └── useItemSuppliers.test.tsx                      # React Query hooks tests
├── lib/
│   ├── inventory/
│   │   └── schemas.test.ts                            # Schema validation tests
│   └── generateSKU.test.ts                            # SKU generation tests
├── integration/
│   └── item-creation-flow.test.tsx                    # End-to-end flow tests
└── utils/
    ├── test-utils.tsx                                 # Custom render utilities
    ├── mock-factories.ts                              # Data factories for tests
    ├── test-helpers.ts                                # Basic test helpers
    └── enhanced-test-helpers.ts                       # Advanced test utilities
```

## Test Categories

### 1. Component Tests (`components/`)

#### ModernCreateItemForm Test Suite
- **ModernCreateItemForm.test.tsx**: Core component functionality tests
  - Rendering and UI elements
  - Basic form validation
  - User interactions
  - Accessibility compliance
  - Edit mode functionality
  - Live preview updates

- **ModernCreateItemForm.navigation.test.tsx**: Step navigation system tests
  - Linear navigation enforcement (create mode)
  - Free navigation (edit mode)
  - Step validation and progress tracking
  - Visual states and completion indicators
  - Navigation button states
  - Keyboard navigation support

- **ModernCreateItemForm.persistence.test.tsx**: Form data persistence tests
  - Step navigation data preservation
  - Dropdown selections persistence
  - Switch states maintenance
  - Hidden field registrations
  - Edit mode data pre-filling
  - Validation state persistence
  - Live preview data consistency

- **ModernCreateItemForm.surgical-fixes.test.tsx**: Surgical fixes following Karpathy Skills
  - Form value preservation during step navigation
  - 50ms timeout precision restoration
  - Hidden field registration maintenance
  - Edge case value handling
  - Debugging and monitoring precision
  - React Hook Form lifecycle integration

### 2. Server Action Tests (`actions/`)
- **createItemAction.test.ts**: Tests for the server-side item creation logic
  - Successful item creation
  - Validation errors
  - Duplicate detection
  - Database error handling
  - Transaction management
  - Data processing

### 3. Library Tests (`lib/`)

#### Schema Validation Tests
- **schemas.test.ts**: Comprehensive schema validation
  - Input validation and field requirements
  - Data coercion and transformations
  - Business logic validation (pricing, stock levels)
  - Numeric field validation and bounds
  - Optional field handling
  - Initial inventory validation
  - Edge cases and error handling
  - Unicode and special character support

#### Utility Function Tests
- **generateSKU.test.ts**: SKU generation utility tests
  - Basic functionality and format validation
  - Randomness and distribution testing
  - Performance benchmarks
  - Character set validation
  - Edge case handling
  - Collision probability analysis
  - Integration compatibility testing

### 4. Hook Tests (`hooks/`)
- **useItemSuppliers.test.tsx**: React Query hook testing
  - Data fetching and caching
  - Mutation operations (create, update, delete)
  - Error handling and retry logic
  - Loading states management
  - Query invalidation
  - Performance optimization
  - Integration with React Query lifecycle

### 5. Integration Tests (`integration/`)
- **item-creation-flow.test.tsx**: End-to-end workflow tests
  - Complete form submission flow with all steps
  - Validation error handling across workflow
  - Server error handling during submission
  - Edit mode integration workflow
  - Performance and UX integration
  - Data integrity throughout workflow
  - Accessibility integration testing
  - Rapid user interaction handling

## Test Utilities

### Mock Factories (`mock-factories.ts`)
- `createMockCategory()` - Generate mock category data
- `createMockBrand()` - Generate mock brand data
- `createMockUnit()` - Generate mock unit data
- `createMockTaxRate()` - Generate mock tax rate data
- `createMockItemFormData()` - Generate complete form data
- `createMockModernCreateItemFormProps()` - Generate component props

### Test Helpers (`test-helpers.ts`)
- `typeIntoInput()` - Simulate user typing
- `selectFromDropdown()` - Simulate dropdown selection
- `waitForFormValidation()` - Wait for form validation
- `submitForm()` - Submit form and wait
- `navigateToStep()` - Navigate between form steps

### Enhanced Test Helpers (`enhanced-test-helpers.ts`)
- `navigateFormStep()` - Enhanced step navigation with validation
- `fillFormFields()` - Type-safe form field filling
- `selectDropdownOption()` - Enhanced dropdown selection with error handling
- `completeFormSubmission()` - Complete multi-step form workflow
- `assertFormDataPersistence()` - Assert data persistence across steps
- `simulateRapidInteractions()` - Stress testing for rapid user interactions
- `waitForSurgicalFix()` - Wait for surgical fix restoration
- `createMockServerAction()` - Configurable mock server actions
- `verifyFormData()` - Type-safe FormData verification
- `measurePerformance()` - Performance timing utilities
- `assertNotification()` - Enhanced notification assertions
- `testKeyboardNavigation()` - Keyboard accessibility testing
- `checkAccessibilityCompliance()` - Comprehensive accessibility checks

### Custom Render (`test-utils.tsx`)
- Wrapped rendering with necessary providers
- Mock notification system
- Tooltip provider setup

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run specific test files
npm test -- ModernCreateItemForm
npm test -- createItemAction
npm test -- schemas
npm test -- integration
```

## Test Coverage

The test suite covers:

### Component Testing
- ✅ Form rendering
- ✅ Step navigation
- ✅ Field validation
- ✅ User interactions
- ✅ Error handling
- ✅ Loading states
- ✅ Accessibility
- ✅ Edit mode
- ✅ Live preview

### Server Action Testing
- ✅ Successful creation
- ✅ Input validation
- ✅ Duplicate detection
- ✅ Database errors
- ✅ Transaction handling
- ✅ Error responses
- ✅ Data processing

### Schema Testing
- ✅ Valid data validation
- ✅ Invalid data rejection
- ✅ Type coercion
- ✅ Default values
- ✅ Optional fields
- ✅ Nested objects
- ✅ Edge cases

### Integration Testing
- ✅ Complete workflows
- ✅ Multi-step forms
- ✅ State persistence
- ✅ Error handling
- ✅ Performance
- ✅ Accessibility

## Mocking Strategy

### External Dependencies
- **Prisma Database**: Mocked in `jest.setup.ts`
- **Next.js Router**: Mocked navigation functions
- **File Upload**: Mocked UploadThing utilities
- **Notifications**: Mocked notification system
- **UUID Generation**: Mocked with predictable values

### Server Actions
- Real imports with jest mocking
- Configurable return values
- Error simulation support

### Component Dependencies
- UI component mocking when needed
- Form library integration
- Icon and styling mocks

## Best Practices

### Writing Tests
1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern** (Arrange, Act, Assert)
3. **Mock external dependencies** consistently
4. **Test user interactions** rather than implementation details
5. **Use proper async/await** for user events and API calls

### Test Data
1. **Use factories** for consistent test data generation
2. **Keep test data minimal** but realistic
3. **Use unique identifiers** to avoid conflicts
4. **Reset mocks** between tests

### Assertions
1. **Test user-visible behavior** rather than internal state
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Check accessibility** attributes
4. **Verify error states** and success flows

## Debugging Tests

### Common Issues
1. **Async operations**: Use proper `waitFor` and async/await
2. **Form validation**: Wait for validation to complete
3. **State updates**: Allow time for React re-renders
4. **Mock configuration**: Ensure mocks are properly reset

### Debug Tools
```bash
# Run single test with verbose output
npm test -- --testNamePattern="specific test" --verbose

# Debug mode
npm test -- --detectOpenHandles --forceExit

# Coverage report
npm run test:coverage -- --coverage-reporter=html
```

## Continuous Integration

The test suite is designed to run in CI environments with:
- Deterministic test execution
- Proper cleanup after tests
- Coverage reporting
- Fast execution times
- No external dependencies

## Contributing

When adding new features:
1. **Write tests first** (TDD approach recommended)
2. **Update existing tests** if changing functionality
3. **Add new mock factories** for new data types
4. **Document test utilities** if creating reusable helpers
5. **Maintain test coverage** above 80% for all critical paths