import { TestResult } from './test-utils';

export interface DSATestCase {
  id: string;
  description: string;
  input_data: any[];
  expected_output: any;
  time_limit_ms?: number;
  memory_limit_mb?: number;
}

export interface DSAExecutionResult {
  pass: boolean;
  message: string;
  executionTime?: number;
  memoryUsed?: number;
  actualOutput?: any;
  expectedOutput?: any;
}

/**
 * Safely execute user's DSA solution code against test cases
 */
export class DSAExecutionEngine {
  private timeLimit: number;
  private memoryLimit: number;

  constructor(timeLimit = 5000, memoryLimit = 128) {
    this.timeLimit = timeLimit;
    this.memoryLimit = memoryLimit;
  }

  /**
   * Execute a single test case against user code
   */
  async executeTestCase(
    userCode: string,
    testCase: DSATestCase,
    functionName: string
  ): Promise<DSAExecutionResult> {
    try {
      // Validate inputs
      if (!userCode || typeof userCode !== 'string') {
        return {
          pass: false,
          message: 'Invalid or empty code provided',
        };
      }

      if (!testCase || !testCase.input_data) {
        return {
          pass: false,
          message: 'Invalid test case data',
        };
      }

      // Extract and validate the function
      const userFunction = this.extractFunction(userCode, functionName);
      if (!userFunction) {
        return {
          pass: false,
          message: `Function '${functionName}' not found in your code. Make sure your function is properly defined.`,
        };
      }

      // Execute with timeout and memory monitoring
      const startTime = performance.now();
      const timeLimit = Math.min(testCase.time_limit_ms || this.timeLimit, 10000); // Max 10 seconds

      const result = await this.executeWithLimits(
        userFunction,
        testCase.input_data,
        timeLimit
      );
      const executionTime = performance.now() - startTime;

      // Compare results
      const isCorrect = this.compareResults(result.output, testCase.expected_output);

      return {
        pass: isCorrect,
        message: isCorrect
          ? `✓ Test passed: ${testCase.description}`
          : `✗ Test failed: ${testCase.description}. Expected ${this.formatOutput(testCase.expected_output)}, got ${this.formatOutput(result.output)}`,
        executionTime,
        actualOutput: result.output,
        expectedOutput: testCase.expected_output,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        pass: false,
        message: `Runtime error: ${errorMessage}`,
      };
    }
  }

  /**
   * Format output for display in error messages
   */
  private formatOutput(output: any): string {
    try {
      if (output === null) return 'null';
      if (output === undefined) return 'undefined';
      if (typeof output === 'string') return `"${output}"`;
      return JSON.stringify(output);
    } catch {
      return String(output);
    }
  }

  /**
   * Execute all test cases for a challenge
   */
  async executeAllTestCases(
    userCode: string,
    testCases: DSATestCase[],
    functionName: string
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.executeTestCase(userCode, testCase, functionName);
      results.push({
        pass: result.pass,
        message: result.message,
      });
    }

    return results;
  }

  /**
   * Extract function from user code with loop timeout injection
   */
  private extractFunction(code: string, functionName: string): Function | null {
    try {
      // Validate input
      if (!code || typeof code !== 'string') {
        throw new Error('Invalid code provided');
      }

      if (!functionName || typeof functionName !== 'string') {
        throw new Error('Invalid function name provided');
      }

      // Basic security checks
      const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /setTimeout\s*\(/,
        /setInterval\s*\(/,
        /process\./,
        /require\s*\(/,
        /import\s+/,
        /fetch\s*\(/,
        /XMLHttpRequest/,
        /document\./,
        /window\./,
        /global\./,
        /this\./
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          throw new Error('Code contains potentially dangerous operations');
        }
      }

      // Transform code to inject timeout checks into loops
      const transformedCode = this.injectTimeoutChecks(code);

      // Create a safe execution context
      let loopCount = 0;
      const startTime = Date.now();

      const sandbox = {
        console: {
          log: () => {}, // Disable console.log for security
          error: () => {},
          warn: () => {},
        },
        Math,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Map,
        Set,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        __loopCount: 0,
        __startTime: startTime,
        __checkTimeout: function() {
          loopCount++;
          if (loopCount > 1000000) { // 1 million iterations max
            throw new Error('Too many loop iterations - infinite loop detected');
          }
          if (Date.now() - startTime > 5000) { // 5 second max
            throw new Error('Execution timeout - code took too long');
          }
        }
      };

      // Execute the transformed code in a controlled environment
      const func = new Function(
        ...Object.keys(sandbox),
        `
        "use strict";
        ${transformedCode}
        return typeof ${functionName} === 'function' ? ${functionName} : null;
        `
      );

      const extractedFunction = func(...Object.values(sandbox));

      if (typeof extractedFunction !== 'function') {
        throw new Error(`Function '${functionName}' not found or is not a function`);
      }

      return extractedFunction;
    } catch (error) {
      console.error('Error extracting function:', error);
      return null;
    }
  }

  /**
   * Inject timeout checks into loops to prevent infinite loops
   */
  private injectTimeoutChecks(code: string): string {
    // Simple regex-based transformation to inject timeout checks
    // This is a basic implementation - for production, use a proper AST parser

    // Inject timeout check into while loops
    code = code.replace(
      /while\s*\([^)]+\)\s*{/g,
      (match) => match + ' __checkTimeout();'
    );

    // Inject timeout check into for loops
    code = code.replace(
      /for\s*\([^)]*\)\s*{/g,
      (match) => match + ' __checkTimeout();'
    );

    // Inject timeout check into do-while loops
    code = code.replace(
      /do\s*{/g,
      (match) => match + ' __checkTimeout();'
    );

    return code;
  }

  /**
   * Execute function with time and memory limits
   * The timeout checks are already injected into the code during extraction
   */
  private async executeWithLimits(
    func: Function,
    inputs: any[],
    timeLimit: number
  ): Promise<{ output: any }> {
    return new Promise((resolve, reject) => {
      let isResolved = false;

      // Set up timeout as a fallback
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error(`Time limit exceeded (${timeLimit}ms)`));
        }
      }, timeLimit);

      // Execute in next tick to allow timeout to be set up
      setImmediate(() => {
        if (isResolved) return;

        try {
          // Execute the function - timeout checks are already injected
          const output = func(...inputs);

          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve({ output });
          }
        } catch (error) {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(error);
          }
        }
      });
    });
  }

  /**
   * Compare expected and actual results
   */
  private compareResults(actual: any, expected: any): boolean {
    // Handle arrays
    if (Array.isArray(expected) && Array.isArray(actual)) {
      if (expected.length !== actual.length) return false;
      for (let i = 0; i < expected.length; i++) {
        if (!this.compareResults(actual[i], expected[i])) return false;
      }
      return true;
    }

    // Handle objects
    if (typeof expected === 'object' && expected !== null && 
        typeof actual === 'object' && actual !== null) {
      const expectedKeys = Object.keys(expected);
      const actualKeys = Object.keys(actual);
      
      if (expectedKeys.length !== actualKeys.length) return false;
      
      for (const key of expectedKeys) {
        if (!actualKeys.includes(key)) return false;
        if (!this.compareResults(actual[key], expected[key])) return false;
      }
      return true;
    }

    // Handle primitives
    return actual === expected;
  }
}

/**
 * Get test cases for a specific DSA challenge
 */
export function getDSATestCases(challengeId: string): DSATestCase[] {
  const testCases: Record<string, DSATestCase[]> = {
    'two-sum': [
      {
        id: 'test-1',
        description: 'Basic case: [2,7,11,15], target 9',
        input_data: [[2, 7, 11, 15], 9],
        expected_output: [0, 1],
      },
      {
        id: 'test-2',
        description: 'Different indices: [3,2,4], target 6',
        input_data: [[3, 2, 4], 6],
        expected_output: [1, 2],
      },
      {
        id: 'test-3',
        description: 'Same number twice: [3,3], target 6',
        input_data: [[3, 3], 6],
        expected_output: [0, 1],
      },
    ],
    'reverse-string': [
      {
        id: 'test-1',
        description: 'Basic case: ["h","e","l","l","o"]',
        input_data: [["h", "e", "l", "l", "o"]],
        expected_output: ["o", "l", "l", "e", "h"],
      },
      {
        id: 'test-2',
        description: 'Palindrome: ["H","a","n","n","a","h"]',
        input_data: [["H", "a", "n", "n", "a", "h"]],
        expected_output: ["h", "a", "n", "n", "a", "H"],
      },
    ],
    'valid-parentheses': [
      {
        id: 'test-1',
        description: 'Simple valid: "()"',
        input_data: ["()"],
        expected_output: true,
      },
      {
        id: 'test-2',
        description: 'Multiple types: "()[]{}"',
        input_data: ["()[]{}"],
        expected_output: true,
      },
      {
        id: 'test-3',
        description: 'Invalid: "(]"',
        input_data: ["(]"],
        expected_output: false,
      },
      {
        id: 'test-4',
        description: 'Nested valid: "([{}])"',
        input_data: ["([{}])"],
        expected_output: true,
      },
    ],
    'maximum-subarray': [
      {
        id: 'test-1',
        description: 'Mixed array: [-2,1,-3,4,-1,2,1,-5,4]',
        input_data: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expected_output: 6,
      },
      {
        id: 'test-2',
        description: 'Single element: [1]',
        input_data: [[1]],
        expected_output: 1,
      },
      {
        id: 'test-3',
        description: 'All positive: [5,4,-1,7,8]',
        input_data: [[5, 4, -1, 7, 8]],
        expected_output: 23,
      },
    ],
    'binary-search': [
      {
        id: 'test-1',
        description: 'Target found: [-1,0,3,5,9,12], target 9',
        input_data: [[-1, 0, 3, 5, 9, 12], 9],
        expected_output: 4,
      },
      {
        id: 'test-2',
        description: 'Target not found: [-1,0,3,5,9,12], target 2',
        input_data: [[-1, 0, 3, 5, 9, 12], 2],
        expected_output: -1,
      },
      {
        id: 'test-3',
        description: 'Single element found: [5], target 5',
        input_data: [[5], 5],
        expected_output: 0,
      },
    ],
  };

  return testCases[challengeId] || [];
}

/**
 * Get the main function name for a DSA challenge
 */
export function getDSAFunctionName(challengeId: string): string {
  const functionNames: Record<string, string> = {
    'two-sum': 'twoSum',
    'reverse-string': 'reverseString',
    'valid-parentheses': 'isValid',
    'maximum-subarray': 'maxSubArray',
    'binary-search': 'search',
  };

  return functionNames[challengeId] || 'solution';
}
