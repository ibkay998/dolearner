// Tests for the Toggle Switch Challenge

export const toggleTests = {
  // Test 1: Check if the component defines a Toggle component with state
  toggleComponentWithState: `// Check if the component defines a Toggle component with state
const definesToggleComponent = componentCode.includes('Toggle') && 
                              (componentCode.includes('function Toggle') || 
                               componentCode.includes('const Toggle'));

const usesReactState = componentCode.includes('useState') && 
                      (componentCode.includes('useState(') || 
                       componentCode.includes('useState ='));

const hasToggleState = componentCode.includes('isOn') || 
                      componentCode.includes('toggled') || 
                      componentCode.includes('active') || 
                      componentCode.includes('enabled') || 
                      componentCode.includes('checked') || 
                      componentCode.includes('switched');

TestResult = {
  pass: definesToggleComponent && usesReactState && hasToggleState,
  message: definesToggleComponent && usesReactState && hasToggleState
    ? 'Component correctly defines a Toggle component with state'
    : 'Component should define a Toggle component that uses React state to track toggle status'
};`,

  // Test 2: Check if the toggle changes state when clicked
  toggleChangesState: `// Check if the toggle changes state when clicked
const hasClickHandler = componentCode.includes('onClick') && 
                       componentCode.includes('set');

const togglesState = (componentCode.includes('!') && 
                     (componentCode.includes('setIsOn(!isOn') || 
                      componentCode.includes('setToggled(!toggled') || 
                      componentCode.includes('setActive(!active') || 
                      componentCode.includes('setEnabled(!enabled') || 
                      componentCode.includes('setChecked(!checked') || 
                      componentCode.includes('setSwitched(!switched'))) || 
                     (componentCode.includes('prev') && 
                      componentCode.includes('=>') && 
                      componentCode.includes('!'));

TestResult = {
  pass: hasClickHandler && togglesState,
  message: hasClickHandler && togglesState
    ? 'Toggle correctly changes state when clicked'
    : 'Toggle should change state when clicked using an onClick handler'
};`,

  // Test 3: Check if the toggle has different visual styles based on state
  toggleVisualStyles: `// Check if the toggle has different visual styles based on state
const hasConditionalStyling = componentCode.includes('?') && 
                             componentCode.includes(':') && 
                             (componentCode.includes('isOn') || 
                              componentCode.includes('toggled') || 
                              componentCode.includes('active') || 
                              componentCode.includes('enabled') || 
                              componentCode.includes('checked') || 
                              componentCode.includes('switched'));

const hasBlueWhenOn = componentCode.includes('blue') && 
                     (componentCode.includes('isOn') || 
                      componentCode.includes('toggled') || 
                      componentCode.includes('active') || 
                      componentCode.includes('enabled') || 
                      componentCode.includes('checked') || 
                      componentCode.includes('switched'));

const hasGrayWhenOff = componentCode.includes('gray') && 
                      (componentCode.includes('!isOn') || 
                       componentCode.includes('!toggled') || 
                       componentCode.includes('!active') || 
                       componentCode.includes('!enabled') || 
                       componentCode.includes('!checked') || 
                       componentCode.includes('!switched') || 
                       componentCode.includes('? ') && componentCode.includes(': gray'));

TestResult = {
  pass: hasConditionalStyling && hasBlueWhenOn && hasGrayWhenOff,
  message: hasConditionalStyling && hasBlueWhenOn && hasGrayWhenOff
    ? 'Toggle correctly has different visual styles based on state (blue when on, gray when off)'
    : 'Toggle should have different visual styles based on state (blue when on, gray when off)'
};`,

  // Test 4: Check if the toggle includes a sliding animation
  toggleSlidingAnimation: `// Check if the toggle includes a sliding animation
const hasTranslateOrTransform = componentCode.includes('translate') || 
                               componentCode.includes('transform');

const hasTransition = componentCode.includes('transition');

const hasDifferentPositions = (componentCode.includes('translate-x-') && 
                              componentCode.includes('?') && 
                              componentCode.includes(':')) || 
                             (componentCode.includes('transform') && 
                              componentCode.includes('?') && 
                              componentCode.includes(':'));

TestResult = {
  pass: hasTranslateOrTransform && hasTransition && hasDifferentPositions,
  message: hasTranslateOrTransform && hasTransition && hasDifferentPositions
    ? 'Toggle correctly includes a sliding animation with transition'
    : 'Toggle should include a sliding animation with transition between states'
};`
};
