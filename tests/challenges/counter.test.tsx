import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const counterTests = [
  // Test 1: Check if the counter starts at 0
  async (Component: any): Promise<TestResult> => {
    try {
      // Clean up any previous renders
      cleanup();

      const { container } = render(<Component />);

      // Look for a number display that shows 0
      const hasZero = container.textContent?.includes('0');

      if (!hasZero) {
        return {
          pass: false,
          message: 'Counter should start at 0. Make sure you initialize your state with 0.',
        };
      }

      return {
        pass: true,
        message: 'Counter starts at 0.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing initial counter value: ${error.message}`,
      };
    }
  },

  // Test 2: Check if the counter has increment button
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);

      // Look for a button with + or text indicating increment
      const buttons = Array.from(container.querySelectorAll('button'));
      const incrementButton = buttons.find(button =>
        button.textContent?.includes('+') ||
        button.textContent?.toLowerCase().includes('increment') ||
        button.textContent?.toLowerCase().includes('add')
      );

      if (!incrementButton) {
        return {
          pass: false,
          message: 'Could not find an increment button. Make sure you have a button with "+" or "increment" text.',
        };
      }

      return {
        pass: true,
        message: 'Increment button found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing increment button: ${error.message}`,
      };
    }
  },

  // Test 3: Check if the counter has decrement button
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);

      // Look for a button with - or text indicating decrement
      const buttons = Array.from(container.querySelectorAll('button'));
      const decrementButton = buttons.find(button =>
        button.textContent?.includes('-') ||
        button.textContent?.toLowerCase().includes('decrement') ||
        button.textContent?.toLowerCase().includes('subtract')
      );

      if (!decrementButton) {
        return {
          pass: false,
          message: 'Could not find a decrement button. Make sure you have a button with "-" or "decrement" text.',
        };
      }

      return {
        pass: true,
        message: 'Decrement button found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing decrement button: ${error.message}`,
      };
    }
  },

  // Test 4: Check if the counter has reset button
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);

      // Look for a button with reset text
      const buttons = Array.from(container.querySelectorAll('button'));
      const resetButton = buttons.find(button =>
        button.textContent?.toLowerCase().includes('reset')
      );

      if (!resetButton) {
        return {
          pass: false,
          message: 'Could not find a reset button. Make sure you have a button with "reset" text.',
        };
      }

      return {
        pass: true,
        message: 'Reset button found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing reset button: ${error.message}`,
      };
    }
  },

  // Test 5: Check if clicking increment increases the counter
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);

      // Find the increment button
      const buttons = Array.from(container.querySelectorAll('button'));
      const incrementButton = buttons.find(button =>
        button.textContent?.includes('+') ||
        button.textContent?.toLowerCase().includes('increment') ||
        button.textContent?.toLowerCase().includes('add')
      );

      if (!incrementButton) {
        return {
          pass: false,
          message: 'Could not find an increment button.',
        };
      }

      // Click the increment button
      fireEvent.click(incrementButton);

      // Check if the counter increased to 1
      const hasOne = container.textContent?.includes('1');

      if (!hasOne) {
        return {
          pass: false,
          message: 'Counter did not increase when increment button was clicked.',
        };
      }

      return {
        pass: true,
        message: 'Counter increases when increment button is clicked.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing increment functionality: ${error.message}`,
      };
    }
  },

  // Test 6: Check if counter doesn't go below 0
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);

      // Find the decrement button
      const buttons = Array.from(container.querySelectorAll('button'));
      const decrementButton = buttons.find(button =>
        button.textContent?.includes('-') ||
        button.textContent?.toLowerCase().includes('decrement') ||
        button.textContent?.toLowerCase().includes('subtract')
      );

      if (!decrementButton) {
        return {
          pass: false,
          message: 'Could not find a decrement button.',
        };
      }

      // Click the decrement button multiple times
      fireEvent.click(decrementButton);
      fireEvent.click(decrementButton);

      // Check if the counter is still at 0 (shouldn't go negative)
      const hasZero = container.textContent?.match(/\b0\b/);
      const hasNegative = container.textContent?.match(/-\d+/);

      if (hasNegative) {
        return {
          pass: false,
          message: 'Counter went below 0. Make sure your decrement function prevents negative values.',
        };
      }

      if (!hasZero) {
        return {
          pass: false,
          message: 'Counter should stay at 0 when decrement is clicked at 0.',
        };
      }

      return {
        pass: true,
        message: 'Counter correctly prevents going below 0.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing minimum counter value: ${error.message}`,
      };
    }
  },
];
