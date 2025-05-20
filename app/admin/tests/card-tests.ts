// Tests for the Card Challenge

export const cardTests = {
  // Test 1: Check if the component defines a Card component that accepts title, content, and footer props
  cardComponentWithProps: `// Check if the component defines a Card component with required props
const definesCardComponent = componentCode.includes('Card') && 
                            (componentCode.includes('function Card') || 
                             componentCode.includes('const Card'));

const acceptsTitleProp = componentCode.includes('title') && 
                        (componentCode.includes('title =') || 
                         componentCode.includes('title}') || 
                         componentCode.includes('title,'));

const acceptsContentProp = componentCode.includes('content') && 
                          (componentCode.includes('content =') || 
                           componentCode.includes('content}') || 
                           componentCode.includes('content,'));

const acceptsFooterProp = componentCode.includes('footer') && 
                         (componentCode.includes('footer =') || 
                          componentCode.includes('footer}') || 
                          componentCode.includes('footer,'));

TestResult = {
  pass: definesCardComponent && acceptsTitleProp && acceptsContentProp && acceptsFooterProp,
  message: definesCardComponent && acceptsTitleProp && acceptsContentProp && acceptsFooterProp
    ? 'Component correctly defines a Card component with title, content, and footer props'
    : 'Component should define a Card component that accepts title, content, and footer props'
};`,

  // Test 2: Check if the card has a border and rounded corners
  cardStyling: `// Check if the card has a border and rounded corners
const hasBorder = componentCode.includes('border') && 
                 !componentCode.includes('border: none') && 
                 !componentCode.includes('border:none');

const hasRoundedCorners = componentCode.includes('rounded') || 
                         componentCode.includes('border-radius');

TestResult = {
  pass: hasBorder && hasRoundedCorners,
  message: hasBorder && hasRoundedCorners
    ? 'Card correctly has a border and rounded corners'
    : 'Card should have a border and rounded corners'
};`,

  // Test 3: Check if the card renders the title, content, and footer in separate sections
  separateSections: `// Check if the card renders title, content, and footer in separate sections
const hasTitleSection = componentCode.includes('title') && 
                       (componentCode.includes('<div') || 
                        componentCode.includes('<header'));

const hasContentSection = componentCode.includes('content') && 
                         componentCode.includes('<div');

const hasFooterSection = componentCode.includes('footer') && 
                        (componentCode.includes('<div') || 
                         componentCode.includes('<footer'));

const hasConditionalFooter = componentCode.includes('footer') && 
                            (componentCode.includes('footer &&') || 
                             componentCode.includes('footer ?'));

TestResult = {
  pass: hasTitleSection && hasContentSection && hasFooterSection && hasConditionalFooter,
  message: hasTitleSection && hasContentSection && hasFooterSection && hasConditionalFooter
    ? 'Card correctly renders title, content, and footer in separate sections with conditional footer'
    : 'Card should render title, content, and footer in separate sections, with the footer being conditional'
};`,

  // Test 4: Check if the component uses the Card component with all required props
  usesCardComponent: `// Check if the component uses the Card component with all required props
const usesCardWithTitle = componentCode.includes('title=') || 
                         componentCode.includes('title:') || 
                         componentCode.includes('title={');

const usesCardWithContent = componentCode.includes('content=') || 
                           componentCode.includes('content:') || 
                           componentCode.includes('content={');

const usesCardWithFooter = componentCode.includes('footer=') || 
                          componentCode.includes('footer:') || 
                          componentCode.includes('footer={');

TestResult = {
  pass: usesCardWithTitle && usesCardWithContent && usesCardWithFooter,
  message: usesCardWithTitle && usesCardWithContent && usesCardWithFooter
    ? 'Component correctly uses the Card component with all required props'
    : 'Component should use the Card component with title, content, and footer props'
};`
};
