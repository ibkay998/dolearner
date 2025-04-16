import { render, screen, fireEvent } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const toggleTests = [
  // Test 1: Check if the toggle component exists
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      
      // Look for a button or div that might be a toggle
      const toggleElements = container.querySelectorAll('button, div[role="switch"]');
      
      if (toggleElements.length === 0) {
        return {
          pass: false,
          message: 'No toggle elements found. Make sure you create a toggle component with a button or div with role="switch".',
        };
      }
      
      return {
        pass: true,
        message: 'Toggle component found.',
      };
    } catch (error) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if the toggle starts in the off state
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      
      // Check for text indicating "Off" state
      const hasOffText = container.textContent?.includes('Off');
      
      // Check for gray background which typically indicates off state
      const toggleElements = container.querySelectorAll('button, div[role="switch"]');
      const hasGrayClass = Array.from(toggleElements).some(el => 
        el.className.includes('bg-gray')
      );
      
      if (!hasOffText && !hasGrayClass) {
        return {
          pass: false,
          message: 'Toggle should start in the off state. Make sure it has gray background or shows "Off" text.',
        };
      }
      
      return {
        pass: true,
        message: 'Toggle starts in the off state.',
      };
    } catch (error) {
      return {
        pass: false,
        message: `Error testing initial toggle state: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if clicking the toggle changes its state
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      
      // Find the toggle element
      const toggleElements = container.querySelectorAll('button, div[role="switch"]');
      
      if (toggleElements.length === 0) {
        return {
          pass: false,
          message: 'No toggle elements found.',
        };
      }
      
      const toggleElement = toggleElements[0];
      
      // Click the toggle
      fireEvent.click(toggleElement);
      
      // Check for text indicating "On" state after click
      const hasOnText = container.textContent?.includes('On');
      
      // Check for blue background which typically indicates on state
      const hasBlueClass = Array.from(container.querySelectorAll('button, div[role="switch"]')).some(el => 
        el.className.includes('bg-blue')
      );
      
      if (!hasOnText && !hasBlueClass) {
        return {
          pass: false,
          message: 'Toggle state did not change when clicked. Make sure it changes to blue background or shows "On" text.',
        };
      }
      
      return {
        pass: true,
        message: 'Toggle changes state when clicked.',
      };
    } catch (error) {
      return {
        pass: false,
        message: `Error testing toggle click: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if the toggle has a sliding animation
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      
      // Look for transform or translate classes which indicate animation
      const hasTransformClass = container.innerHTML.includes('transform') || 
                               container.innerHTML.includes('translate');
      
      if (!hasTransformClass) {
        return {
          pass: false,
          message: 'Toggle does not appear to have a sliding animation. Make sure to use transform or translate classes.',
        };
      }
      
      return {
        pass: true,
        message: 'Toggle has sliding animation.',
      };
    } catch (error) {
      return {
        pass: false,
        message: `Error testing toggle animation: ${error.message}`,
      };
    }
  },
];
