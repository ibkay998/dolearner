import { TestResult } from './test-utils';
import { transform } from '@babel/standalone';

/**
 * Specialized testing functions for different challenge types
 * These functions analyze code without needing a DOM
 */

interface ASTNode {
  type: string;
  name?: string;
  value?: any;
  body?: ASTNode[];
  expression?: ASTNode;
  callee?: ASTNode;
  arguments?: ASTNode[];
  properties?: ASTNode[];
  key?: ASTNode;
  declarations?: ASTNode[];
  id?: ASTNode;
  init?: ASTNode;
  left?: ASTNode;
  right?: ASTNode;
  operator?: string;
  [key: string]: any;
}

/**
 * Parse code into an AST for more detailed analysis
 */
function parseCode(code: string): ASTNode | null {
  try {
    // Transform the code using Babel
    const { ast } = transform(code, {
      presets: ['react'],
      filename: 'component.jsx',
      sourceType: 'module',
      ast: true,
    });
    
    return ast as unknown as ASTNode;
  } catch (error) {
    console.error('Error parsing code:', error);
    return null;
  }
}

/**
 * Find all JSX elements of a specific type in the AST
 */
function findJSXElements(ast: ASTNode | null, elementType: string): ASTNode[] {
  if (!ast) return [];
  
  const elements: ASTNode[] = [];
  
  function traverse(node: ASTNode) {
    if (!node) return;
    
    // Check if this is a JSX element with the specified type
    if (node.type === 'JSXElement' && 
        node.openingElement && 
        node.openingElement.name && 
        node.openingElement.name.name === elementType) {
      elements.push(node);
    }
    
    // Traverse all properties of the node
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => {
            if (child && typeof child === 'object') {
              traverse(child);
            }
          });
        } else {
          traverse(node[key]);
        }
      }
    }
  }
  
  traverse(ast);
  return elements;
}

/**
 * Find all useState hooks in the AST
 */
function findUseStateHooks(ast: ASTNode | null): ASTNode[] {
  if (!ast) return [];
  
  const hooks: ASTNode[] = [];
  
  function traverse(node: ASTNode) {
    if (!node) return;
    
    // Check if this is a call to useState
    if (node.type === 'CallExpression' && 
        node.callee && 
        ((node.callee.type === 'Identifier' && node.callee.name === 'useState') ||
         (node.callee.type === 'MemberExpression' && 
          node.callee.object && 
          node.callee.object.type === 'Identifier' && 
          node.callee.object.name === 'React' &&
          node.callee.property &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'useState'))) {
      hooks.push(node);
    }
    
    // Traverse all properties of the node
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => {
            if (child && typeof child === 'object') {
              traverse(child);
            }
          });
        } else {
          traverse(node[key]);
        }
      }
    }
  }
  
  traverse(ast);
  return hooks;
}

/**
 * Find all useEffect hooks in the AST
 */
function findUseEffectHooks(ast: ASTNode | null): ASTNode[] {
  if (!ast) return [];
  
  const hooks: ASTNode[] = [];
  
  function traverse(node: ASTNode) {
    if (!node) return;
    
    // Check if this is a call to useEffect
    if (node.type === 'CallExpression' && 
        node.callee && 
        ((node.callee.type === 'Identifier' && node.callee.name === 'useEffect') ||
         (node.callee.type === 'MemberExpression' && 
          node.callee.object && 
          node.callee.object.type === 'Identifier' && 
          node.callee.object.name === 'React' &&
          node.callee.property &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'useEffect'))) {
      hooks.push(node);
    }
    
    // Traverse all properties of the node
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => {
            if (child && typeof child === 'object') {
              traverse(child);
            }
          });
        } else {
          traverse(node[key]);
        }
      }
    }
  }
  
  traverse(ast);
  return hooks;
}

/**
 * Find all event handlers in the AST
 */
function findEventHandlers(ast: ASTNode | null): { eventType: string, handler: ASTNode }[] {
  if (!ast) return [];
  
  const handlers: { eventType: string, handler: ASTNode }[] = [];
  
  function traverse(node: ASTNode) {
    if (!node) return;
    
    // Check if this is a JSX element with event handlers
    if (node.type === 'JSXElement' && node.openingElement && node.openingElement.attributes) {
      node.openingElement.attributes.forEach((attr: any) => {
        if (attr.type === 'JSXAttribute' && 
            attr.name && 
            attr.name.name && 
            attr.name.name.startsWith('on') && 
            attr.value) {
          handlers.push({
            eventType: attr.name.name,
            handler: attr.value
          });
        }
      });
    }
    
    // Traverse all properties of the node
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach((child: any) => {
            if (child && typeof child === 'object') {
              traverse(child);
            }
          });
        } else {
          traverse(node[key]);
        }
      }
    }
  }
  
  traverse(ast);
  return handlers;
}

/**
 * Test a button component
 */
export function testButtonComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if a button element exists
  const buttons = findJSXElements(ast, 'button');
  results.push({
    pass: buttons.length > 0,
    message: buttons.length > 0 
      ? 'Component includes a button element'
      : 'Component should include a button element'
  });
  
  // Test 2: Check if the button has a variant or className prop
  if (buttons.length > 0) {
    let hasVariantOrClass = false;
    
    for (const button of buttons) {
      if (button.openingElement && button.openingElement.attributes) {
        for (const attr of button.openingElement.attributes) {
          if (attr.type === 'JSXAttribute' && 
              attr.name && 
              (attr.name.name === 'variant' || attr.name.name === 'className')) {
            hasVariantOrClass = true;
            break;
          }
        }
      }
      
      if (hasVariantOrClass) break;
    }
    
    results.push({
      pass: hasVariantOrClass,
      message: hasVariantOrClass 
        ? 'Button has variant or className prop'
        : 'Button should have a variant or className prop for styling'
    });
  }
  
  // Test 3: Check if the button has children/content
  if (buttons.length > 0) {
    let hasContent = false;
    
    for (const button of buttons) {
      if (button.children && button.children.length > 0) {
        hasContent = true;
        break;
      }
    }
    
    results.push({
      pass: hasContent,
      message: hasContent 
        ? 'Button has content'
        : 'Button should have content (text or elements)'
    });
  }
  
  return results;
}

/**
 * Test a counter component
 */
export function testCounterComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if useState is used
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses useState for state management'
      : 'Component should use useState for state management'
  });
  
  // Test 2: Check if there are buttons for incrementing/decrementing
  const buttons = findJSXElements(ast, 'button');
  results.push({
    pass: buttons.length >= 2,
    message: buttons.length >= 2 
      ? 'Component has multiple buttons for counter controls'
      : 'Component should have at least two buttons (increment and decrement)'
  });
  
  // Test 3: Check if there are event handlers
  const eventHandlers = findEventHandlers(ast);
  results.push({
    pass: eventHandlers.length >= 2,
    message: eventHandlers.length >= 2 
      ? 'Component has event handlers for user interaction'
      : 'Component should have event handlers for user interaction'
  });
  
  // Test 4: Check if the state is displayed
  const hasStateDisplay = code.includes('{count}') || 
                          code.includes('{ count }') || 
                          code.includes('{counter}') || 
                          code.includes('{ counter }') ||
                          code.includes('{state}') || 
                          code.includes('{ state }');
  
  results.push({
    pass: hasStateDisplay,
    message: hasStateDisplay 
      ? 'Component displays the counter state'
      : 'Component should display the counter state'
  });
  
  return results;
}

/**
 * Test a data fetching component
 */
export function testDataFetchingComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if useState is used
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses useState for state management'
      : 'Component should use useState for state management'
  });
  
  // Test 2: Check if useEffect is used
  const useEffectHooks = findUseEffectHooks(ast);
  results.push({
    pass: useEffectHooks.length > 0,
    message: useEffectHooks.length > 0 
      ? 'Component uses useEffect for side effects'
      : 'Component should use useEffect for side effects'
  });
  
  // Test 3: Check if there's a loading state
  const hasLoadingState = code.includes('loading') || 
                          code.includes('isLoading') || 
                          code.includes('fetching');
  
  results.push({
    pass: hasLoadingState,
    message: hasLoadingState 
      ? 'Component handles loading state'
      : 'Component should handle loading state'
  });
  
  // Test 4: Check if there's error handling
  const hasErrorHandling = code.includes('error') || 
                           code.includes('catch') || 
                           code.includes('try');
  
  results.push({
    pass: hasErrorHandling,
    message: hasErrorHandling 
      ? 'Component handles error state'
      : 'Component should handle error state'
  });
  
  // Test 5: Check if data is displayed
  const hasDataDisplay = code.includes('.map(') || 
                         code.includes('data[') || 
                         code.includes('data.') ||
                         (code.includes('data') && code.includes('?'));
  
  results.push({
    pass: hasDataDisplay,
    message: hasDataDisplay 
      ? 'Component displays fetched data'
      : 'Component should display fetched data'
  });
  
  return results;
}

/**
 * Test a card component
 */
export function testCardComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if there's a container element
  const divs = findJSXElements(ast, 'div');
  results.push({
    pass: divs.length > 0,
    message: divs.length > 0 
      ? 'Component has a container element'
      : 'Component should have a container element'
  });
  
  // Test 2: Check if there's a title element
  const hasTitle = findJSXElements(ast, 'h1').length > 0 || 
                   findJSXElements(ast, 'h2').length > 0 || 
                   findJSXElements(ast, 'h3').length > 0;
  
  results.push({
    pass: hasTitle,
    message: hasTitle 
      ? 'Component has a title element'
      : 'Component should have a title element (h1, h2, or h3)'
  });
  
  // Test 3: Check if there's content
  const hasContent = code.includes('children') || 
                     (divs.length > 0 && divs.some(div => div.children && div.children.length > 1));
  
  results.push({
    pass: hasContent,
    message: hasContent 
      ? 'Component has content area'
      : 'Component should have a content area'
  });
  
  // Test 4: Check if there's styling
  const hasStyling = code.includes('className') || 
                     code.includes('style=') || 
                     code.includes('css');
  
  results.push({
    pass: hasStyling,
    message: hasStyling 
      ? 'Component has styling'
      : 'Component should have styling (className, style, or css)'
  });
  
  return results;
}

/**
 * Test a form component
 */
export function testFormComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if there's a form element
  const forms = findJSXElements(ast, 'form');
  results.push({
    pass: forms.length > 0,
    message: forms.length > 0 
      ? 'Component has a form element'
      : 'Component should have a form element'
  });
  
  // Test 2: Check if there are input elements
  const inputs = findJSXElements(ast, 'input');
  results.push({
    pass: inputs.length > 0,
    message: inputs.length > 0 
      ? 'Component has input elements'
      : 'Component should have input elements'
  });
  
  // Test 3: Check if there's a submit button
  const hasSubmitButton = code.includes('type="submit"') || 
                          code.includes("type='submit'") ||
                          code.includes('onSubmit=');
  
  results.push({
    pass: hasSubmitButton,
    message: hasSubmitButton 
      ? 'Component has a submit button or form submission handler'
      : 'Component should have a submit button or form submission handler'
  });
  
  // Test 4: Check if there's state management
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses state management for form data'
      : 'Component should use state management for form data'
  });
  
  // Test 5: Check if there are event handlers
  const eventHandlers = findEventHandlers(ast);
  results.push({
    pass: eventHandlers.length > 0,
    message: eventHandlers.length > 0 
      ? 'Component has event handlers for form interaction'
      : 'Component should have event handlers for form interaction'
  });
  
  return results;
}

/**
 * Test a tabs component
 */
export function testTabsComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if there's state management for active tab
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses state management for active tab'
      : 'Component should use state management for active tab'
  });
  
  // Test 2: Check if there are tab buttons/headers
  const buttons = findJSXElements(ast, 'button');
  const hasTabButtons = buttons.length > 1;
  
  results.push({
    pass: hasTabButtons,
    message: hasTabButtons 
      ? 'Component has multiple tab buttons'
      : 'Component should have multiple tab buttons'
  });
  
  // Test 3: Check if there's conditional rendering for tab content
  const hasConditionalRendering = code.includes('?') || 
                                 code.includes('&&') || 
                                 code.includes('===') ||
                                 code.includes('==');
  
  results.push({
    pass: hasConditionalRendering,
    message: hasConditionalRendering 
      ? 'Component uses conditional rendering for tab content'
      : 'Component should use conditional rendering for tab content'
  });
  
  // Test 4: Check if there are event handlers for tab switching
  const eventHandlers = findEventHandlers(ast);
  results.push({
    pass: eventHandlers.length > 0,
    message: eventHandlers.length > 0 
      ? 'Component has event handlers for tab switching'
      : 'Component should have event handlers for tab switching'
  });
  
  return results;
}

/**
 * Test a theme switcher component
 */
export function testThemeSwitcherComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if there's state management for theme
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses state management for theme'
      : 'Component should use state management for theme'
  });
  
  // Test 2: Check if there's a toggle button or switch
  const buttons = findJSXElements(ast, 'button');
  const hasToggle = buttons.length > 0 || 
                    findJSXElements(ast, 'input').some(input => {
                      if (input.openingElement && input.openingElement.attributes) {
                        return input.openingElement.attributes.some((attr: any) => 
                          attr.type === 'JSXAttribute' && 
                          attr.name && 
                          attr.name.name === 'type' && 
                          attr.value && 
                          attr.value.value === 'checkbox'
                        );
                      }
                      return false;
                    });
  
  results.push({
    pass: hasToggle,
    message: hasToggle 
      ? 'Component has a toggle button or switch'
      : 'Component should have a toggle button or switch'
  });
  
  // Test 3: Check if there's theme application
  const hasThemeApplication = code.includes('className') && 
                             (code.includes('dark') || 
                              code.includes('light') || 
                              code.includes('theme'));
  
  results.push({
    pass: hasThemeApplication,
    message: hasThemeApplication 
      ? 'Component applies theme classes'
      : 'Component should apply theme classes'
  });
  
  // Test 4: Check if there are event handlers for theme switching
  const eventHandlers = findEventHandlers(ast);
  results.push({
    pass: eventHandlers.length > 0,
    message: eventHandlers.length > 0 
      ? 'Component has event handlers for theme switching'
      : 'Component should have event handlers for theme switching'
  });
  
  return results;
}

/**
 * Test a todo list component
 */
export function testTodoListComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if there's state management for todos
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses state management for todos'
      : 'Component should use state management for todos'
  });
  
  // Test 2: Check if there's a form or input for adding todos
  const hasInput = findJSXElements(ast, 'input').length > 0;
  const hasForm = findJSXElements(ast, 'form').length > 0;
  
  results.push({
    pass: hasInput || hasForm,
    message: (hasInput || hasForm)
      ? 'Component has input for adding todos'
      : 'Component should have input for adding todos'
  });
  
  // Test 3: Check if there's a list rendering
  const hasList = code.includes('.map(') || 
                 findJSXElements(ast, 'ul').length > 0 || 
                 findJSXElements(ast, 'ol').length > 0;
  
  results.push({
    pass: hasList,
    message: hasList 
      ? 'Component renders a list of todos'
      : 'Component should render a list of todos'
  });
  
  // Test 4: Check if there are event handlers for adding/removing todos
  const eventHandlers = findEventHandlers(ast);
  results.push({
    pass: eventHandlers.length > 0,
    message: eventHandlers.length > 0 
      ? 'Component has event handlers for todo management'
      : 'Component should have event handlers for todo management'
  });
  
  // Test 5: Check if there's functionality to mark todos as complete
  const hasCompleteFunctionality = code.includes('complete') || 
                                  code.includes('done') || 
                                  code.includes('finished') ||
                                  code.includes('checked') ||
                                  findJSXElements(ast, 'input').some(input => {
                                    if (input.openingElement && input.openingElement.attributes) {
                                      return input.openingElement.attributes.some((attr: any) => 
                                        attr.type === 'JSXAttribute' && 
                                        attr.name && 
                                        attr.name.name === 'type' && 
                                        attr.value && 
                                        attr.value.value === 'checkbox'
                                      );
                                    }
                                    return false;
                                  });
  
  results.push({
    pass: hasCompleteFunctionality,
    message: hasCompleteFunctionality 
      ? 'Component has functionality to mark todos as complete'
      : 'Component should have functionality to mark todos as complete'
  });
  
  return results;
}

/**
 * Test a toggle component
 */
export function testToggleComponent(code: string): TestResult[] {
  const results: TestResult[] = [];
  const ast = parseCode(code);
  
  // Test 1: Check if there's state management for toggle state
  const useStateHooks = findUseStateHooks(ast);
  results.push({
    pass: useStateHooks.length > 0,
    message: useStateHooks.length > 0 
      ? 'Component uses state management for toggle state'
      : 'Component should use state management for toggle state'
  });
  
  // Test 2: Check if there's a button or input for toggling
  const hasButton = findJSXElements(ast, 'button').length > 0;
  const hasCheckbox = findJSXElements(ast, 'input').some(input => {
    if (input.openingElement && input.openingElement.attributes) {
      return input.openingElement.attributes.some((attr: any) => 
        attr.type === 'JSXAttribute' && 
        attr.name && 
        attr.name.name === 'type' && 
        attr.value && 
        attr.value.value === 'checkbox'
      );
    }
    return false;
  });
  
  results.push({
    pass: hasButton || hasCheckbox,
    message: (hasButton || hasCheckbox)
      ? 'Component has a toggle control'
      : 'Component should have a button or checkbox for toggling'
  });
  
  // Test 3: Check if there's visual feedback for the toggle state
  const hasVisualFeedback = code.includes('className') && 
                           (code.includes('active') || 
                            code.includes('checked') || 
                            code.includes('selected') ||
                            code.includes('enabled') ||
                            code.includes('disabled'));
  
  results.push({
    pass: hasVisualFeedback,
    message: hasVisualFeedback 
      ? 'Component provides visual feedback for toggle state'
      : 'Component should provide visual feedback for toggle state'
  });
  
  // Test 4: Check if there are event handlers for toggling
  const eventHandlers = findEventHandlers(ast);
  results.push({
    pass: eventHandlers.length > 0,
    message: eventHandlers.length > 0 
      ? 'Component has event handlers for toggling'
      : 'Component should have event handlers for toggling'
  });
  
  return results;
}

/**
 * Get the appropriate test function for a challenge
 */
export function getTestFunctionForChallenge(challengeId: string): ((code: string) => TestResult[]) | null {
  switch (challengeId) {
    case 'button':
      return testButtonComponent;
    case 'card':
      return testCardComponent;
    case 'counter':
      return testCounterComponent;
    case 'data-fetching':
      return testDataFetchingComponent;
    case 'form':
      return testFormComponent;
    case 'tabs':
      return testTabsComponent;
    case 'theme-switcher':
      return testThemeSwitcherComponent;
    case 'todo-list':
      return testTodoListComponent;
    case 'toggle':
      return testToggleComponent;
    default:
      return null;
  }
}
