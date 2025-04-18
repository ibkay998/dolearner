import { render, cleanup } from '@testing-library/react';
import { transform } from '@babel/standalone';
import React from 'react';
import { actWrapper } from './test-act-wrapper';

/**
 * Compiles a React component string into a usable component
 * @param code The component code as a string
 * @returns The compiled React component
 */
export function compileComponent(code: string) {
  try {
    console.log('🔨 compiling code:', code);
    // Transform the code using Babel
    const { code: transformedCode } = transform(code, {
      presets: ['react'],
      filename: 'component.jsx',
      sourceType: 'module',
    });
    console.log('🧩 transformedCode:\n', transformedCode);

    const evalCode = new Function('React', `
      ${transformedCode}
      return Component;
    `);
    // ← This is where require('react') is blowing up:
    console.log("got here")
    console.log('✅ babel transform succeeded, now evaluating…', evalCode);
    const CompFn = evalCode(React);
    return function WrappedComponent(props:any) {
      console.log('🔄 WrappedComponent rendering with props:', props);

      // In React 19, we need to be more careful about how we handle components
      // Just return the component directly and let React handle the rendering
      return React.createElement(CompFn, props);
    }


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
export async function renderComponent(code: string) {
  const Component = compileComponent(code);
  let renderResult;
  await actWrapper(async () => {
    renderResult = render(<Component />);
  });
  return renderResult;
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
      message: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }));
  }

  const results: TestResult[] = [];

  // Run each test in sequence to avoid parallel rendering issues
  for (const test of tests) {
    try {
      // Clean up before each test to ensure a fresh environment
      cleanup();

      // Create a timeout for each test to prevent hanging
      const testWithTimeout = async () => {
        const timeoutPromise = new Promise<TestResult>((_, reject) => {
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('Test timed out after 5 seconds'));
          }, 5000);
        });

        try {
          // In React 19, we need to be more careful with act
          // Run the test directly and let act be called inside the test if needed
          const result = await Promise.race([
            test(Component),
            timeoutPromise
          ]);

          if (result) {
            return result;
          } else {
            throw new Error('Test did not return a result');
          }
        } catch (innerError) {
          throw innerError;
        }
      };

      // Execute the test with timeout
      const result = await testWithTimeout();
      results.push(result);

      // Clean up after each test
      cleanup();
    } catch (error) {
      results.push({
        pass: false,
        message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      // Make sure to clean up even if the test fails
      cleanup();
    }
  }
  console.log('📝 testComponent results:', results);

  return results;
}

export interface TestResult {
  pass: boolean;
  message: string;
}
