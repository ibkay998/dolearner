import { render, screen } from '@testing-library/react';
import { compileComponent, TestResult } from '@/utils/test-utils';

export const buttonTests = [
  // Test 1: Check if the Button component exists
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      const buttons = container.querySelectorAll('button');
      
      if (buttons.length === 0) {
        return {
          pass: false,
          message: 'No button elements found. Make sure you create a Button component that renders a button element.',
        };
      }
      
      return {
        pass: true,
        message: 'Button component found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if the Button component accepts a variant prop
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      
      // Look for primary and secondary buttons
      const primaryButtonText = container.textContent?.includes('Primary Button');
      const secondaryButtonText = container.textContent?.includes('Secondary Button');
      
      if (!primaryButtonText || !secondaryButtonText) {
        return {
          pass: false,
          message: 'Could not find both "Primary Button" and "Secondary Button" text. Make sure your Button component renders with both variants.',
        };
      }
      
      return {
        pass: true,
        message: 'Button component accepts variant prop and renders different button types.',
      };
    } catch (error) {
      return {
        pass: false,
        message: `Error testing variant prop: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if the primary button has the correct styling
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      const buttons = Array.from(container.querySelectorAll('button'));
      
      // Find the primary button (assuming it contains the text "Primary")
      const primaryButton = buttons.find(button => 
        button.textContent?.includes('Primary')
      );
      
      if (!primaryButton) {
        return {
          pass: false,
          message: 'Could not find a button with "Primary" text.',
        };
      }
      
      // Check if it has blue background class
      const hasBlueClass = primaryButton.className.includes('bg-blue');
      const hasWhiteTextClass = primaryButton.className.includes('text-white');
      
      if (!hasBlueClass || !hasWhiteTextClass) {
        return {
          pass: false,
          message: 'Primary button should have blue background (bg-blue-*) and white text (text-white) classes.',
        };
      }
      
      return {
        pass: true,
        message: 'Primary button has correct styling.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing primary button styling: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if the secondary button has the correct styling
  async (Component: any): Promise<TestResult> => {
    try {
      const { container } = render(<Component />);
      const buttons = Array.from(container.querySelectorAll('button'));
      
      // Find the secondary button (assuming it contains the text "Secondary")
      const secondaryButton = buttons.find(button => 
        button.textContent?.includes('Secondary')
      );
      
      if (!secondaryButton) {
        return {
          pass: false,
          message: 'Could not find a button with "Secondary" text.',
        };
      }
      
      // Check if it has gray background class
      const hasGrayClass = secondaryButton.className.includes('bg-gray');
      
      if (!hasGrayClass) {
        return {
          pass: false,
          message: 'Secondary button should have gray background (bg-gray-*) class.',
        };
      }
      
      return {
        pass: true,
        message: 'Secondary button has correct styling.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing secondary button styling: ${error.message}`,
      };
    }
  },
];
