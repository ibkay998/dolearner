import { buttonTests } from './challenges/button.test';
import { render, cleanup } from '@testing-library/react';
import React from 'react';

// Simple Button component for testing
const TestButton = () => {
  return (
    <div>
      <button>Primary Button</button>
      <button>Secondary Button</button>
    </div>
  );
};

describe('Button Tests', () => {
  afterEach(() => {
    cleanup();
  });

  it('should run all button tests successfully', async () => {
    for (const testFn of buttonTests) {
      const result = await testFn(TestButton);
      expect(result.pass).toBe(true);
    }
  });
});
