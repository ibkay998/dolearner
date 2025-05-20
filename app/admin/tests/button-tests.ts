// Tests for the Button Challenge

export const buttonTests = {
  // Test 1: Check if the component defines a Button component that accepts a variant prop
  buttonComponentWithVariantProp: `// Check if the component defines a Button component that accepts a variant prop
const definesBtnComponent = componentCode.includes('Button') && 
                           (componentCode.includes('function Button') || 
                            componentCode.includes('const Button'));

const acceptsVariantProp = componentCode.includes('variant') && 
                          (componentCode.includes('variant =') || 
                           componentCode.includes('variant}') || 
                           componentCode.includes('variant,'));

TestResult = {
  pass: definesBtnComponent && acceptsVariantProp,
  message: definesBtnComponent && acceptsVariantProp
    ? 'Component correctly defines a Button component that accepts a variant prop'
    : 'Component should define a Button component that accepts a variant prop'
};`,

  // Test 2: Check if the component renders both primary and secondary buttons
  rendersBothButtonVariants: `// Check if the component renders both primary and secondary buttons
const rendersPrimaryBtn = componentCode.includes('variant="primary"') || 
                         componentCode.includes("variant='primary'") || 
                         componentCode.includes('variant={\\\"primary\\\"}');

const rendersSecondaryBtn = componentCode.includes('variant="secondary"') || 
                           componentCode.includes("variant='secondary'") || 
                           componentCode.includes('variant={\\\"secondary\\\"}');

TestResult = {
  pass: rendersPrimaryBtn && rendersSecondaryBtn,
  message: rendersPrimaryBtn && rendersSecondaryBtn
    ? 'Component correctly renders both primary and secondary button variants'
    : 'Component should render both primary and secondary button variants'
};`,

  // Test 3: Check if the primary button has blue background and white text
  primaryButtonStyling: `// Check if the primary button has blue background and white text
const hasPrimaryLogic = componentCode.includes('variant === "primary"') || 
                       componentCode.includes("variant === 'primary'") || 
                       componentCode.includes('variant==="primary"') || 
                       componentCode.includes("variant==='primary'");

const hasBlueBackground = componentCode.includes('blue') && 
                         (componentCode.includes('bg-blue') || 
                          componentCode.includes('background') && componentCode.includes('blue'));

const hasWhiteText = componentCode.includes('white') && 
                    (componentCode.includes('text-white') || 
                     componentCode.includes('color') && componentCode.includes('white'));

TestResult = {
  pass: hasPrimaryLogic && hasBlueBackground && hasWhiteText,
  message: hasPrimaryLogic && hasBlueBackground && hasWhiteText
    ? 'Primary button correctly has blue background and white text'
    : 'Primary button should have blue background and white text'
};`,

  // Test 4: Check if the secondary button has gray background
  secondaryButtonStyling: `// Check if the secondary button has gray background
const hasSecondaryLogic = componentCode.includes('variant === "secondary"') || 
                         componentCode.includes("variant === 'secondary'") || 
                         componentCode.includes('variant==="secondary"') || 
                         componentCode.includes("variant==='secondary'") || 
                         componentCode.includes('variant !== "primary"') || 
                         componentCode.includes("variant !== 'primary'");

const hasGrayBackground = componentCode.includes('gray') && 
                         (componentCode.includes('bg-gray') || 
                          componentCode.includes('background') && componentCode.includes('gray'));

TestResult = {
  pass: (hasSecondaryLogic || hasPrimaryLogic) && hasGrayBackground,
  message: (hasSecondaryLogic || hasPrimaryLogic) && hasGrayBackground
    ? 'Secondary button correctly has gray background'
    : 'Secondary button should have gray background'
};`
};
