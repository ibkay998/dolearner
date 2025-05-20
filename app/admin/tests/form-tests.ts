// Tests for the Form Challenge

export const formTests = {
  // Test 1: Check if the component defines a form with name and email fields
  formWithFields: `// Check if the component defines a form with name and email fields
const hasFormElement = componentCode.includes('<form') && 
                      componentCode.includes('</form>');

const hasNameInput = componentCode.includes('name') && 
                    (componentCode.includes('input') || 
                     componentCode.includes('Input'));

const hasEmailInput = componentCode.includes('email') && 
                     (componentCode.includes('input') || 
                      componentCode.includes('Input'));

TestResult = {
  pass: hasFormElement && hasNameInput && hasEmailInput,
  message: hasFormElement && hasNameInput && hasEmailInput
    ? 'Component correctly defines a form with name and email fields'
    : 'Component should define a form with name and email input fields'
};`,

  // Test 2: Check if the form uses state to track input values
  formUsesState: `// Check if the form uses state to track input values
const usesNameState = componentCode.includes('[name') || 
                     componentCode.includes('name,') || 
                     componentCode.includes('name =');

const usesEmailState = componentCode.includes('[email') || 
                      componentCode.includes('email,') || 
                      componentCode.includes('email =');

const usesOnChange = componentCode.includes('onChange') && 
                    (componentCode.includes('setName') || 
                     componentCode.includes('setEmail'));

TestResult = {
  pass: usesNameState && usesEmailState && usesOnChange,
  message: usesNameState && usesEmailState && usesOnChange
    ? 'Form correctly uses state to track input values'
    : 'Form should use React state to track name and email input values'
};`,

  // Test 3: Check if the form validates that name is not empty
  formValidatesName: `// Check if the form validates that name is not empty
const checksEmptyName = (componentCode.includes('name.trim()') || 
                        componentCode.includes('name.trim() ===') || 
                        componentCode.includes('name.trim() !==') || 
                        componentCode.includes('name ===') || 
                        componentCode.includes('name !==')) && 
                       (componentCode.includes('""') || 
                        componentCode.includes("''") || 
                        componentCode.includes('empty') || 
                        componentCode.includes('required'));

const hasNameError = componentCode.includes('nameError') || 
                    componentCode.includes('errors') && 
                    componentCode.includes('name');

TestResult = {
  pass: checksEmptyName && hasNameError,
  message: checksEmptyName && hasNameError
    ? 'Form correctly validates that name is not empty'
    : 'Form should validate that the name field is not empty'
};`,

  // Test 4: Check if the form validates that email contains @
  formValidatesEmail: `// Check if the form validates that email contains @
const checksEmailFormat = componentCode.includes('email') && 
                         componentCode.includes('@') && 
                         (componentCode.includes('includes') || 
                          componentCode.includes('indexOf') || 
                          componentCode.includes('match') || 
                          componentCode.includes('test') || 
                          componentCode.includes('regex') || 
                          componentCode.includes('RegExp'));

const hasEmailError = componentCode.includes('emailError') || 
                     componentCode.includes('errors') && 
                     componentCode.includes('email');

TestResult = {
  pass: checksEmailFormat && hasEmailError,
  message: checksEmailFormat && hasEmailError
    ? 'Form correctly validates that email contains @'
    : 'Form should validate that the email field contains an @ symbol'
};`,

  // Test 5: Check if the form shows error messages
  formShowsErrors: `// Check if the form shows error messages
const displaysNameError = componentCode.includes('nameError') && 
                         componentCode.includes('{') && 
                         componentCode.includes('}');

const displaysEmailError = componentCode.includes('emailError') && 
                          componentCode.includes('{') && 
                          componentCode.includes('}');

const hasConditionalErrorDisplay = componentCode.includes('&&') && 
                                  (componentCode.includes('Error') || 
                                   componentCode.includes('error'));

TestResult = {
  pass: (displaysNameError || displaysEmailError) && hasConditionalErrorDisplay,
  message: (displaysNameError || displaysEmailError) && hasConditionalErrorDisplay
    ? 'Form correctly shows error messages'
    : 'Form should show error messages when validation fails'
};`,

  // Test 6: Check if the submit button is disabled until the form is valid
  formDisablesSubmit: `// Check if the submit button is disabled until the form is valid
const hasSubmitButton = componentCode.includes('submit') || 
                       componentCode.includes('Submit');

const hasDisabledAttribute = componentCode.includes('disabled=') || 
                            componentCode.includes('disabled={');

const disabledBasedOnValidity = componentCode.includes('isValid') || 
                               componentCode.includes('valid') || 
                               componentCode.includes('!error');

TestResult = {
  pass: hasSubmitButton && hasDisabledAttribute && disabledBasedOnValidity,
  message: hasSubmitButton && hasDisabledAttribute && disabledBasedOnValidity
    ? 'Form correctly disables submit button until the form is valid'
    : 'Form should disable the submit button until all validation passes'
};`
};
