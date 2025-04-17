import { render } from '@testing-library/react';
import { transform } from '@babel/standalone';

/**
 * Compiles a React component string into a usable component
 * @param code The component code as a string
 * @returns The compiled React component
 */
export function compileComponent(code: string) {
  try {
    // Transform the code using Babel
    const { code: transformedCode } = transform(code, {
      presets: ['react'],
      filename: 'component.jsx',
      sourceType: 'module',
    });

    // Create a function that will evaluate the code and return the Component
    const evalCode = new Function('React', `
      ${transformedCode}
      return Component;
    `);

    // Execute the function with React as an argument
    const Component = evalCode(require('react'));
    return Component;
  } catch (error) {
    console.error('Error compiling component:', error);
    throw error;
  }
}

/**
 * Renders a component from code string for testing
 * @param code The component code as a string
 * @returns The rendered component and testing utilities
 */
export function renderComponent(code: string) {
  const Component = compileComponent(code);
  return render(<Component />);
}

/**
 * Tests a component against a set of test functions
 * @param code The component code as a string
 * @param tests Array of test functions to run
 * @returns Test results with pass/fail status and messages
 */
export async function testComponent(code: string, tests: Array<(component: any) => Promise<TestResult>>) {
  // Compile the component once to avoid multiple compilations
  let Component;
  try {
    Component = compileComponent(code);
  } catch (error) {
    // If compilation fails, return error for all tests
    return tests.map(() => ({
      pass: false,
      message: `Compilation error: ${error.message}`,
    }));
  }

  const results: TestResult[] = [];

  // Run each test in sequence to avoid parallel rendering issues
  for (const test of tests) {
    try {
      const result = await test(Component);
      results.push(result);

      // Clean up any rendered components to prevent memory leaks
      // and multiple renders appearing in the DOM
      if (typeof document !== 'undefined') {
        // Allow time for React to clean up
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (error) {
      results.push({
        pass: false,
        message: `Test error: ${error.message}`,
      });
    }
  }

  return results;
}

export interface TestResult {
  pass: boolean;
  message: string;
}
