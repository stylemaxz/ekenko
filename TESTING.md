# Testing Guide

## Overview
This project uses **Jest** and **React Testing Library** for unit and integration testing.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Structure

### 1. Unit Tests
Located in `src/__tests__/`

- **auth.test.ts** - Tests for authentication utilities (password hashing, JWT)
- **employeeService.test.ts** - Tests for employee service CRUD operations
- **api.test.ts** - Integration tests for API routes

### 2. Test Coverage

Current test coverage includes:
- ✅ Authentication (password hashing, JWT signing/verification)
- ✅ Employee Service (CRUD operations)
- ✅ API Routes (authorization, validation)

### 3. Writing New Tests

Example test structure:
```typescript
import { yourFunction } from '@/path/to/module';

describe('Module Name', () => {
  describe('Function Name', () => {
    it('should do something', () => {
      const result = yourFunction();
      expect(result).toBe(expectedValue);
    });
  });
});
```

### 4. Mocking

We use Jest mocks for:
- **Prisma Client** - Database operations
- **Next.js APIs** - Request/Response objects
- **Authentication** - Session management

Example:
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findMany: jest.fn(),
    },
  },
}));
```

## Best Practices

1. **Isolate Tests** - Each test should be independent
2. **Clear Mocks** - Use `jest.clearAllMocks()` in `beforeEach`
3. **Descriptive Names** - Use clear test descriptions
4. **Test Edge Cases** - Include error scenarios
5. **Keep Tests Fast** - Mock external dependencies

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run Tests
  run: npm test

- name: Check Coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests failing with module errors
- Ensure all dependencies are installed: `npm install`
- Check `jest.config.ts` for correct path mappings

### Prisma mock issues
- Make sure to mock Prisma before importing services
- Clear mocks between tests

### Timeout errors
- Increase Jest timeout in `jest.config.ts`
- Check for unresolved promises

## Next Steps

Consider adding tests for:
- [ ] Company Service
- [ ] Visit Service
- [ ] Task Service
- [ ] Component Tests (UI)
- [ ] E2E Tests (Playwright/Cypress)
