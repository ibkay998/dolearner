export const testTemplates = {
  basic: `// Basic test template
// This checks if the component contains a specific element or text

// You can access the component code via the 'componentCode' variable
const containsElement = componentCode.includes('<button');
const containsText = componentCode.includes('Click me');

// Set the test result
TestResult = {
  pass: containsElement && containsText,
  message: containsElement && containsText
    ? 'Component contains the required button and text'
    : 'Component is missing the required button or text'
};`,

  stateCheck: `// State check test template
// This checks if the component uses React state

// Check for useState hook
const usesState = componentCode.includes('useState');

// Set the test result
TestResult = {
  pass: usesState,
  message: usesState
    ? 'Component correctly uses React state'
    : 'Component should use the useState hook'
};`,

  eventHandler: `// Event handler test template
// This checks if the component has event handlers

// Check for common event handlers
const hasClickHandler = componentCode.includes('onClick');
const hasChangeHandler = componentCode.includes('onChange');
const hasSubmitHandler = componentCode.includes('onSubmit');

// Set the test result
TestResult = {
  pass: hasClickHandler || hasChangeHandler || hasSubmitHandler,
  message: hasClickHandler || hasChangeHandler || hasSubmitHandler
    ? 'Component has the required event handlers'
    : 'Component is missing event handlers (onClick, onChange, or onSubmit)'
};`,

  cssCheck: `// CSS check test template
// This checks if the component uses specific CSS classes or styles

// Check for specific classes or style attributes
const hasClassName = componentCode.includes('className=');
const hasSpecificClass = componentCode.includes('className="primary"') || 
                         componentCode.includes('className={\`primary\`}') ||
                         componentCode.includes("className='primary'");

// Set the test result
TestResult = {
  pass: hasClassName && hasSpecificClass,
  message: hasClassName && hasSpecificClass
    ? 'Component has the required CSS classes'
    : 'Component is missing the required CSS classes'
};`,

  propsCheck: `// Props check test template
// This checks if the component accepts and uses props

// Check for props usage
const acceptsProps = componentCode.includes('props') || 
                     componentCode.match(/function\\s+\\w+\\s*\\(\\s*\\{[^}]*\\}\\s*\\)/);
const usesProps = componentCode.includes('props.') || 
                  componentCode.match(/\\{\\s*\\w+\\s*\\}/);

// Set the test result
TestResult = {
  pass: acceptsProps && usesProps,
  message: acceptsProps && usesProps
    ? 'Component correctly accepts and uses props'
    : 'Component should accept and use props'
};`,

  childrenCheck: `// Children check test template
// This checks if the component renders children

// Check for children usage
const usesChildren = componentCode.includes('children') || 
                     componentCode.includes('{props.children}');

// Set the test result
TestResult = {
  pass: usesChildren,
  message: usesChildren
    ? 'Component correctly renders children'
    : 'Component should render its children'
};`,

  accessibilityCheck: `// Accessibility check template
// This checks if the component follows basic accessibility practices

// Check for accessibility attributes
const hasAriaLabels = componentCode.includes('aria-');
const hasAltText = componentCode.includes('alt=');
const hasRole = componentCode.includes('role=');

// Set the test result
TestResult = {
  pass: hasAriaLabels || hasAltText || hasRole,
  message: hasAriaLabels || hasAltText || hasRole
    ? 'Component includes accessibility attributes'
    : 'Component should include accessibility attributes (aria-*, alt, role)'
};`,
};

export default testTemplates;
