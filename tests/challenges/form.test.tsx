import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const formTests = [
  // Test 1: Check if the form component exists
  async (Component: any): Promise<TestResult> => {
    try {
      // Clean up any previous renders
      cleanup();
      
      const { container } = render(<Component />);
      
      // Look for a form element
      const formElement = container.querySelector('form');
      
      if (!formElement) {
        return {
          pass: false,
          message: 'No form element found. Make sure you create a form component.',
        };
      }
      
      return {
        pass: true,
        message: 'Form component found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if the form has an email input
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for an email input
      const emailInput = container.querySelector('input[type="email"]') || 
                         container.querySelector('input[placeholder*="email" i]') ||
                         container.querySelector('input[name="email"]');
      
      if (!emailInput) {
        return {
          pass: false,
          message: 'No email input found. Make sure your form has an input for email.',
        };
      }
      
      return {
        pass: true,
        message: 'Form has an email input.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing email input: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if the form has a password input
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for a password input
      const passwordInput = container.querySelector('input[type="password"]') || 
                            container.querySelector('input[placeholder*="password" i]') ||
                            container.querySelector('input[name="password"]');
      
      if (!passwordInput) {
        return {
          pass: false,
          message: 'No password input found. Make sure your form has an input for password.',
        };
      }
      
      return {
        pass: true,
        message: 'Form has a password input.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing password input: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if the form validates email format
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find the email input
      const emailInput = container.querySelector('input[type="email"]') || 
                         container.querySelector('input[placeholder*="email" i]') ||
                         container.querySelector('input[name="email"]');
      
      if (!emailInput) {
        return {
          pass: false,
          message: 'No email input found for validation testing.',
        };
      }
      
      // Enter an invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      // Find the submit button
      const submitButton = container.querySelector('button[type="submit"]') ||
                           Array.from(container.querySelectorAll('button')).find(button => 
                             button.textContent?.toLowerCase().includes('submit') ||
                             button.textContent?.toLowerCase().includes('login') ||
                             button.textContent?.toLowerCase().includes('sign')
                           );
      
      if (!submitButton) {
        return {
          pass: false,
          message: 'No submit button found for validation testing.',
        };
      }
      
      // Try to submit the form
      fireEvent.click(submitButton);
      
      // Check if there's an error message about email format
      const hasEmailError = container.textContent?.includes('valid email') ||
                            container.textContent?.includes('email format') ||
                            container.textContent?.includes('@');
      
      if (!hasEmailError) {
        return {
          pass: false,
          message: 'Form does not appear to validate email format. Make sure to show an error for invalid emails.',
        };
      }
      
      return {
        pass: true,
        message: 'Form validates email format.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing email validation: ${error.message}`,
      };
    }
  },
  
  // Test 5: Check if the form validates password length
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find the password input
      const passwordInput = container.querySelector('input[type="password"]') || 
                            container.querySelector('input[placeholder*="password" i]') ||
                            container.querySelector('input[name="password"]');
      
      if (!passwordInput) {
        return {
          pass: false,
          message: 'No password input found for validation testing.',
        };
      }
      
      // Enter a short password
      fireEvent.change(passwordInput, { target: { value: '123' } });
      
      // Find the submit button
      const submitButton = container.querySelector('button[type="submit"]') ||
                           Array.from(container.querySelectorAll('button')).find(button => 
                             button.textContent?.toLowerCase().includes('submit') ||
                             button.textContent?.toLowerCase().includes('login') ||
                             button.textContent?.toLowerCase().includes('sign')
                           );
      
      if (!submitButton) {
        return {
          pass: false,
          message: 'No submit button found for validation testing.',
        };
      }
      
      // Try to submit the form
      fireEvent.click(submitButton);
      
      // Check if there's an error message about password length
      const hasPasswordError = container.textContent?.includes('password') &&
                              (container.textContent?.includes('length') ||
                               container.textContent?.includes('short') ||
                               container.textContent?.includes('characters'));
      
      if (!hasPasswordError) {
        return {
          pass: false,
          message: 'Form does not appear to validate password length. Make sure to show an error for short passwords.',
        };
      }
      
      return {
        pass: true,
        message: 'Form validates password length.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing password validation: ${error.message}`,
      };
    }
  },
  
  // Test 6: Check if the submit button is disabled when form is invalid
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find the submit button
      const submitButton = container.querySelector('button[type="submit"]') ||
                           Array.from(container.querySelectorAll('button')).find(button => 
                             button.textContent?.toLowerCase().includes('submit') ||
                             button.textContent?.toLowerCase().includes('login') ||
                             button.textContent?.toLowerCase().includes('sign')
                           );
      
      if (!submitButton) {
        return {
          pass: false,
          message: 'No submit button found for validation testing.',
        };
      }
      
      // Check if the button is disabled initially (when form is empty/invalid)
      const isDisabled = submitButton.hasAttribute('disabled') || 
                         submitButton.classList.contains('disabled') ||
                         submitButton.classList.contains('cursor-not-allowed');
      
      if (!isDisabled) {
        return {
          pass: false,
          message: 'Submit button should be disabled when form is invalid.',
        };
      }
      
      return {
        pass: true,
        message: 'Submit button is properly disabled when form is invalid.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing submit button state: ${error.message}`,
      };
    }
  },
];
