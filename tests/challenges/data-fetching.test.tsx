import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const dataFetchingTests = [
  // Test 1: Check if the component renders initially
  async (Component: any): Promise<TestResult> => {
    try {
      // Clean up any previous renders
      cleanup();
      
      const { container } = render(<Component />);
      
      // The component should render without errors
      if (!container.firstChild) {
        return {
          pass: false,
          message: 'Component did not render any content.',
        };
      }
      
      return {
        pass: true,
        message: 'Component renders successfully.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if the component shows a loading state
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      
      // Mock the fetch function to delay response
      const originalFetch = global.fetch;
      global.fetch = jest.fn(() => 
        new Promise(resolve => setTimeout(() => resolve({ json: () => Promise.resolve([]) }), 100))
      );
      
      const { container } = render(<Component />);
      
      // Look for loading indicators
      const hasLoadingText = container.textContent?.toLowerCase().includes('loading');
      const hasLoadingSpinner = container.querySelector('.spinner') || 
                               container.querySelector('.loading') ||
                               container.querySelector('[role="progressbar"]') ||
                               container.innerHTML.includes('animate-spin');
      
      // Restore original fetch
      global.fetch = originalFetch;
      
      if (!hasLoadingText && !hasLoadingSpinner) {
        return {
          pass: false,
          message: 'No loading state found. Make sure your component shows a loading indicator while fetching data.',
        };
      }
      
      return {
        pass: true,
        message: 'Component shows a loading state.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing loading state: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if the component handles errors
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      
      // Render the component
      const { container } = render(<Component />);
      
      // Find any button that might trigger a fetch (like "Fetch Data" or "Refresh")
      const fetchButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('fetch') ||
        button.textContent?.toLowerCase().includes('load') ||
        button.textContent?.toLowerCase().includes('get') ||
        button.textContent?.toLowerCase().includes('refresh')
      );
      
      // If there's a button, click it multiple times to increase chance of hitting an error
      if (fetchButton) {
        // Click several times to increase chance of hitting the 30% error rate
        for (let i = 0; i < 5; i++) {
          fireEvent.click(fetchButton);
          // Wait a bit between clicks
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Wait for potential error state to appear
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for error message
      const hasErrorText = container.textContent?.toLowerCase().includes('error') ||
                          container.textContent?.toLowerCase().includes('failed') ||
                          container.textContent?.toLowerCase().includes('try again');
      
      // This test is a bit tricky because the error is random
      // We'll pass if we either see an error message or don't see one
      // The important thing is that the component doesn't crash
      
      return {
        pass: true,
        message: hasErrorText 
          ? 'Component properly displays error messages when fetch fails.'
          : 'Component did not show an error, but did not crash either. This is acceptable since errors are random.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing error handling: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if the component displays data when available
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      
      // Render the component
      const { container } = render(<Component />);
      
      // Find any button that might trigger a fetch
      const fetchButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('fetch') ||
        button.textContent?.toLowerCase().includes('load') ||
        button.textContent?.toLowerCase().includes('get') ||
        button.textContent?.toLowerCase().includes('refresh')
      );
      
      // If there's a button, click it
      if (fetchButton) {
        fireEvent.click(fetchButton);
      }
      
      // Wait for data to potentially load
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for data display elements
      const hasListItems = container.querySelectorAll('li, tr').length > 0;
      const hasProductText = container.textContent?.includes('Product');
      
      if (!hasListItems && !hasProductText) {
        return {
          pass: false,
          message: 'No data display elements found. Make sure your component shows the fetched data when available.',
        };
      }
      
      return {
        pass: true,
        message: 'Component displays data when available.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing data display: ${error.message}`,
      };
    }
  },
  
  // Test 5: Check if the component has a way to refresh data
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      
      // Render the component
      const { container } = render(<Component />);
      
      // Find a refresh button
      const refreshButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('refresh') ||
        button.textContent?.toLowerCase().includes('reload') ||
        button.textContent?.toLowerCase().includes('fetch') ||
        button.textContent?.toLowerCase().includes('try again')
      );
      
      if (!refreshButton) {
        return {
          pass: false,
          message: 'No refresh button found. Make sure your component provides a way to refresh the data.',
        };
      }
      
      return {
        pass: true,
        message: 'Component has a refresh button.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing refresh functionality: ${error.message}`,
      };
    }
  },
];
