import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const tabsTests = [
  // Test 1: Check if the tabs component exists
  async (Component: any): Promise<TestResult> => {
    try {
      // Clean up any previous renders
      cleanup();
      
      const { container } = render(<Component />);
      
      // Look for tab elements (buttons, divs with role="tab", etc.)
      const tabElements = container.querySelectorAll('button, [role="tab"], .tab, [class*="tab"]');
      
      if (tabElements.length === 0) {
        return {
          pass: false,
          message: 'No tab elements found. Make sure you create a tabs component with clickable tabs.',
        };
      }
      
      // Check if there are at least 3 tabs as required
      if (tabElements.length < 3) {
        return {
          pass: false,
          message: `Only ${tabElements.length} tabs found. The challenge requires at least 3 tabs.`,
        };
      }
      
      return {
        pass: true,
        message: `Found ${tabElements.length} tabs in the component.`,
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if there's a tab content area
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for content areas (divs with role="tabpanel", etc.)
      const contentElements = container.querySelectorAll('[role="tabpanel"], .tab-content, [class*="content"]');
      
      if (contentElements.length === 0) {
        return {
          pass: false,
          message: 'No tab content areas found. Make sure your tabs component displays content for the selected tab.',
        };
      }
      
      return {
        pass: true,
        message: 'Tab content area found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing tab content: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if clicking a tab changes the displayed content
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find all tab elements
      const tabElements = Array.from(container.querySelectorAll('button, [role="tab"], .tab, [class*="tab"]'));
      
      if (tabElements.length < 2) {
        return {
          pass: false,
          message: 'Not enough tabs found to test tab switching.',
        };
      }
      
      // Get the initial content
      const initialContent = container.textContent;
      
      // Click the second tab (index 1)
      fireEvent.click(tabElements[1]);
      
      // Get the new content
      const newContent = container.textContent;
      
      // Check if the content changed
      if (initialContent === newContent) {
        return {
          pass: false,
          message: 'Content did not change after clicking a different tab. Make sure your tabs component updates the displayed content when a tab is clicked.',
        };
      }
      
      return {
        pass: true,
        message: 'Tab content changes when a different tab is clicked.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing tab switching: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if the active tab is visually indicated
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find all tab elements
      const tabElements = Array.from(container.querySelectorAll('button, [role="tab"], .tab, [class*="tab"]'));
      
      if (tabElements.length === 0) {
        return {
          pass: false,
          message: 'No tabs found to test active tab indication.',
        };
      }
      
      // Check if at least one tab has a different styling (active state)
      const hasActiveTab = tabElements.some(tab => {
        const className = tab.className;
        return className.includes('active') || 
               className.includes('selected') || 
               className.includes('current') ||
               className.includes('bg-') ||
               className.includes('border-b-') ||
               className.includes('underline');
      });
      
      if (!hasActiveTab) {
        return {
          pass: false,
          message: 'No visual indication found for the active tab. Make sure your tabs component highlights the currently selected tab.',
        };
      }
      
      // Click a different tab
      const inactiveTabIndex = tabElements.findIndex(tab => 
        !tab.className.includes('active') && 
        !tab.className.includes('selected') && 
        !tab.className.includes('current')
      );
      
      if (inactiveTabIndex >= 0) {
        fireEvent.click(tabElements[inactiveTabIndex]);
        
        // Check if the clicked tab now has active styling
        const newActiveTab = tabElements[inactiveTabIndex];
        const isNowActive = newActiveTab.className.includes('active') || 
                           newActiveTab.className.includes('selected') || 
                           newActiveTab.className.includes('current') ||
                           newActiveTab.className.includes('bg-') ||
                           newActiveTab.className.includes('border-b-') ||
                           newActiveTab.className.includes('underline');
        
        if (!isNowActive) {
          return {
            pass: false,
            message: 'The active tab indicator does not update when a different tab is clicked.',
          };
        }
      }
      
      return {
        pass: true,
        message: 'The active tab is visually indicated and updates when tabs are clicked.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing active tab indication: ${error.message}`,
      };
    }
  },
  
  // Test 5: Check if the tabs component has proper styling
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Check if the tabs container has styling
      const tabsContainer = container.querySelector('[role="tablist"], .tabs, [class*="tabs"]') || container;
      
      const hasTabsContainerStyling = tabsContainer.className.includes('flex') || 
                                     tabsContainer.className.includes('grid') || 
                                     tabsContainer.className.includes('border') ||
                                     tabsContainer.className.includes('bg-');
      
      if (!hasTabsContainerStyling) {
        return {
          pass: false,
          message: 'Tabs container lacks proper styling. Consider adding flex layout, borders, or background colors.',
        };
      }
      
      // Check if individual tabs have styling
      const tabElements = Array.from(container.querySelectorAll('button, [role="tab"], .tab, [class*="tab"]'));
      
      const hasTabStyling = tabElements.some(tab => 
        tab.className.includes('px-') || 
        tab.className.includes('py-') || 
        tab.className.includes('p-') ||
        tab.className.includes('m-') ||
        tab.className.includes('border') ||
        tab.className.includes('rounded')
      );
      
      if (!hasTabStyling) {
        return {
          pass: false,
          message: 'Individual tabs lack proper styling. Consider adding padding, margins, borders, or rounded corners.',
        };
      }
      
      return {
        pass: true,
        message: 'Tabs component has proper styling.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing tabs styling: ${error.message}`,
      };
    }
  },
];
