import { transform } from '@babel/standalone';
import { TestResult } from './test-utils';
import * as vm from 'vm';

/**
 * Server-side function to compile a React component string
 * @param code The component code as a string
 * @returns The compiled code as a string
 */
export function compileComponentCode(code: string): string {
  try {
    // Transform the code using Babel
    const { code: transformedCode } = transform(code, {
      presets: ['react'],
      filename: 'component.jsx',
      sourceType: 'module',
    });

    return transformedCode || '';
  } catch (error) {
    console.error('Error compiling component:', error);
    throw error;
  }
}

/**
 * Server-side function to validate component code
 * This is a simple validation that checks if the code compiles
 * @param code The component code as a string
 * @returns An object with validation result
 */
export function validateComponentCode(code: string): { isValid: boolean; error?: string } {
  try {
    compileComponentCode(code);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Server-side function to check if code contains a solution marker
 * @param code The component code as a string
 * @param solutionMarker The marker to look for
 * @returns Test result indicating if the marker was found
 */
export function checkSolutionMarker(code: string, solutionMarker: string): TestResult {
  const markerFound = code.includes(solutionMarker);

  return {
    pass: markerFound,
    message: markerFound
      ? 'Solution marker found!'
      : 'Solution marker not found. Make sure your solution includes the required elements.'
  };
}

/**
 * Server-side function to run basic static analysis on component code
 * @param code The component code as a string
 * @param requirements Array of strings that should be in the code
 * @returns Array of test results
 */
export function analyzeComponentCode(code: string, requirements: string[]): TestResult[] {
  // If no requirements are provided, perform some basic React component checks
  if (!requirements.length) {
    const basicChecks = [
      {
        check: code.includes('return') && (code.includes('</') || code.includes('/>')),
        message: 'Component returns JSX'
      },
      {
        check: code.includes('useState'),
        message: 'Component uses React state'
      },
      {
        check: code.includes('useEffect'),
        message: 'Component uses side effects'
      },
      {
        check: code.includes('onClick') || code.includes('onChange') || code.includes('onSubmit'),
        message: 'Component handles user interactions'
      }
    ];

    return basicChecks
      .filter(check => check.check) // Only include passing checks
      .map(check => ({
        pass: true,
        message: check.message
      }));
  }

  // Check for specific requirements
  return requirements.map(req => {
    // Skip empty requirements
    if (!req || req.trim() === '') {
      return {
        pass: true,
        message: 'No specific requirement to check'
      };
    }

    const found = code.includes(req);
    return {
      pass: found,
      message: found
        ? `Code includes required element: ${req}`
        : `Code is missing required element: ${req}`
    };
  });
}

/**
 * Server-side function to run test code against a component
 * @param componentCode The component code as a string
 * @param testCode The test code as a string
 * @param expectedResult The expected result of the test (optional)
 * @returns Test result
 */
export async function runTestCode(
  componentCode: string,
  testCode: string,
  expectedResult?: any
): Promise<TestResult> {
  try {
    // Compile the component code
    const compiledComponentCode = compileComponentCode(componentCode);

    // Create a sandbox with necessary globals
    const sandbox = {
      console,
      require: require,
      module: { exports: {} },
      exports: {},
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      process,
      Buffer,
      TestResult: { pass: false, message: '' },
      componentCode: compiledComponentCode,
    };

    // Create a context for the sandbox
    const context = vm.createContext(sandbox);

    // Prepare the test code with the component code
    const fullTestCode = `
      try {
        // Component code
        ${compiledComponentCode}

        // Test code
        ${testCode}
      } catch (error) {
        TestResult = {
          pass: false,
          message: 'Error executing test: ' + (error.message || 'Unknown error')
        };
      }
    `;

    // Run the test code in the sandbox
    vm.runInContext(fullTestCode, context);

    // Get the test result from the sandbox
    const result = sandbox.TestResult as TestResult;

    // If there's an expected result, compare it
    if (expectedResult) {
      const expectedPass = expectedResult.pass === undefined ? true : expectedResult.pass;
      if (result.pass !== expectedPass) {
        return {
          pass: false,
          message: `Test result (${result.pass}) does not match expected result (${expectedPass})`
        };
      }
    }

    return result;
  } catch (error) {
    console.error('Error running test code:', error);
    return {
      pass: false,
      message: `Error running test: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
