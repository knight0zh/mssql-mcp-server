// Load environment variables from .env.test
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock console.error and console.warn to keep test output clean
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Add custom matchers if needed
expect.extend({
  // Add custom matchers here
});
