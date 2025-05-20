// Tests for the Counter Challenge

export const counterTests = {
  // Test 1: Check if the component defines a Counter component with useState
  counterComponentWithState: `// Check if the component defines a Counter component with useState
const definesCounterComponent = componentCode.includes('Counter') && 
                               (componentCode.includes('function Counter') || 
                                componentCode.includes('const Counter'));

const usesReactState = componentCode.includes('useState') && 
                      (componentCode.includes('useState(') || 
                       componentCode.includes('useState ='));

const hasCountState = componentCode.includes('[count') || 
                     componentCode.includes('count,') || 
                     componentCode.includes('count =');

TestResult = {
  pass: definesCounterComponent && usesReactState && hasCountState,
  message: definesCounterComponent && usesReactState && hasCountState
    ? 'Component correctly defines a Counter component with useState'
    : 'Component should define a Counter component that uses useState to track count'
};`,

  // Test 2: Check if the counter has increment and decrement buttons
  counterHasButtons: `// Check if the counter has increment and decrement buttons
const hasIncrementButton = componentCode.includes('increment') || 
                          (componentCode.includes('+') && 
                           componentCode.includes('onClick'));

const hasDecrementButton = componentCode.includes('decrement') || 
                          (componentCode.includes('-') && 
                           componentCode.includes('onClick'));

const hasResetButton = componentCode.includes('reset') && 
                      componentCode.includes('onClick');

TestResult = {
  pass: hasIncrementButton && hasDecrementButton && hasResetButton,
  message: hasIncrementButton && hasDecrementButton && hasResetButton
    ? 'Counter correctly has increment, decrement, and reset buttons'
    : 'Counter should have increment, decrement, and reset buttons'
};`,

  // Test 3: Check if the counter prevents going below 0
  counterPreventsNegative: `// Check if the counter prevents going below 0
const preventsNegative = (componentCode.includes('count > 0') || 
                         componentCode.includes('count >= 0') || 
                         componentCode.includes('prev > 0') || 
                         componentCode.includes('prev >= 0')) && 
                        (componentCode.includes('?') || 
                         componentCode.includes('if'));

const usesMaxFunction = componentCode.includes('Math.max') && 
                       componentCode.includes('0');

TestResult = {
  pass: preventsNegative || usesMaxFunction,
  message: preventsNegative || usesMaxFunction
    ? 'Counter correctly prevents going below 0'
    : 'Counter should prevent going below 0 when decrementing'
};`,

  // Test 4: Check if the reset button sets the counter back to 0
  counterResetWorks: `// Check if the reset button sets the counter back to 0
const hasResetFunction = componentCode.includes('reset') && 
                        (componentCode.includes('function') || 
                         componentCode.includes('=>'));

const resetsToZero = componentCode.includes('setCount(0)') || 
                    componentCode.includes('setCount(0);') || 
                    componentCode.includes('setCount(() => 0)') || 
                    componentCode.includes('setCount(() => 0);');

TestResult = {
  pass: hasResetFunction && resetsToZero,
  message: hasResetFunction && resetsToZero
    ? 'Counter correctly resets to 0 when reset button is clicked'
    : 'Counter should reset to 0 when the reset button is clicked'
};`,

  // Test 5: Check if the counter displays the current count
  counterDisplaysCount: `// Check if the counter displays the current count
const displaysCount = componentCode.includes('{count}') || 
                     componentCode.includes('{ count }') || 
                     componentCode.includes('{state}') || 
                     componentCode.includes('{ state }');

TestResult = {
  pass: displaysCount,
  message: displaysCount
    ? 'Counter correctly displays the current count'
    : 'Counter should display the current count value'
};`
};
