// Import all test collections
import { buttonTests } from './button-tests';
import { cardTests } from './card-tests';
import { toggleTests } from './toggle-tests';
import { counterTests } from './counter-tests';
import { formTests } from './form-tests';

// Export all tests by challenge ID
export const allTests = {
  button: buttonTests,
  card: cardTests,
  toggle: toggleTests,
  counter: counterTests,
  form: formTests,
};

// Helper function to get tests for a specific challenge
export const getTestsForChallenge = (challengeId: string) => {
  return allTests[challengeId as keyof typeof allTests] || {};
};
