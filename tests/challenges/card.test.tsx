import { render, screen, cleanup } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const cardTests = [
  // Test 1: Check if the Card component exists
  async (Component: any): Promise<TestResult> => {
    try {
      // Clean up any previous renders
      cleanup();
      
      const { container } = render(<Component />);
      
      // Look for a card-like structure
      const cardElements = container.querySelectorAll('div');
      
      // Check if there's at least one div with border or shadow classes
      const hasCardElement = Array.from(cardElements).some(el => 
        el.className.includes('border') || 
        el.className.includes('shadow') ||
        el.className.includes('rounded')
      );
      
      if (!hasCardElement) {
        return {
          pass: false,
          message: 'No card-like elements found. Make sure you create a Card component with border, shadow, or rounded corners.',
        };
      }
      
      return {
        pass: true,
        message: 'Card component found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if the Card component accepts title prop
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for a title element
      const titleElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6, .title, [class*="title"]');
      const hasTitleElement = titleElements.length > 0;
      
      if (!hasTitleElement) {
        return {
          pass: false,
          message: 'No title element found in the Card. Make sure your Card component accepts and displays a title prop.',
        };
      }
      
      // Check if there's a sample title text
      const hasExampleTitle = Array.from(titleElements).some(el => 
        el.textContent && el.textContent.trim().length > 0
      );
      
      if (!hasExampleTitle) {
        return {
          pass: false,
          message: 'Title element found but it appears to be empty. Make sure your Card displays the title prop.',
        };
      }
      
      return {
        pass: true,
        message: 'Card component displays a title.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing title prop: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if the Card component accepts content prop
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for content in the card (paragraphs or divs with text)
      const contentElements = container.querySelectorAll('p, .content, [class*="content"]');
      const hasContentElement = contentElements.length > 0;
      
      if (!hasContentElement) {
        return {
          pass: false,
          message: 'No content element found in the Card. Make sure your Card component accepts and displays content.',
        };
      }
      
      // Check if there's sample content text
      const hasExampleContent = Array.from(contentElements).some(el => 
        el.textContent && el.textContent.trim().length > 0
      );
      
      if (!hasExampleContent) {
        return {
          pass: false,
          message: 'Content element found but it appears to be empty. Make sure your Card displays the content prop.',
        };
      }
      
      return {
        pass: true,
        message: 'Card component displays content.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing content prop: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if the Card component accepts footer prop
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for a footer element
      const footerElements = container.querySelectorAll('footer, .footer, [class*="footer"]');
      
      // If no explicit footer element, look for a div at the bottom of the card
      let hasFooterElement = footerElements.length > 0;
      
      // If no explicit footer, check for a div that might be acting as a footer
      if (!hasFooterElement) {
        const allDivs = Array.from(container.querySelectorAll('div'));
        // Look for divs that might be acting as footers (positioned at the bottom or with specific styling)
        const possibleFooters = allDivs.filter(div => {
          const className = div.className;
          return className.includes('bottom') || 
                 className.includes('mt-') || 
                 className.includes('border-t');
        });
        
        hasFooterElement = possibleFooters.length > 0;
      }
      
      if (!hasFooterElement) {
        return {
          pass: false,
          message: 'No footer element found in the Card. Make sure your Card component accepts and displays a footer prop.',
        };
      }
      
      return {
        pass: true,
        message: 'Card component displays a footer.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing footer prop: ${error.message}`,
      };
    }
  },
  
  // Test 5: Check if the Card has proper styling
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for a card with proper styling
      const cardElements = Array.from(container.querySelectorAll('div'));
      
      // Check for rounded corners
      const hasRoundedCorners = cardElements.some(el => 
        el.className.includes('rounded')
      );
      
      // Check for border
      const hasBorder = cardElements.some(el => 
        el.className.includes('border')
      );
      
      // Check for shadow
      const hasShadow = cardElements.some(el => 
        el.className.includes('shadow')
      );
      
      if (!hasRoundedCorners && !hasBorder && !hasShadow) {
        return {
          pass: false,
          message: 'Card is missing proper styling. It should have at least one of: rounded corners, border, or shadow.',
        };
      }
      
      return {
        pass: true,
        message: 'Card has proper styling.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing card styling: ${error.message}`,
      };
    }
  },
];
