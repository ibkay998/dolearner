import { buttonTests } from './button.test';
import { cardTests } from './card.test';
import { counterTests } from './counter.test';
import { dataFetchingTests } from './data-fetching.test';
import { formTests } from './form.test';
import { tabsTests } from './tabs.test';
import { themeSwitcherTests } from './theme-switcher.test';
import { todoListTests } from './todo-list.test';
import { toggleTests } from './toggle.test';

// Export all tests
export const challengeTests = {
  button: buttonTests,
  card: cardTests,
  counter: counterTests,
  'data-fetching': dataFetchingTests,
  form: formTests,
  tabs: tabsTests,
  'theme-switcher': themeSwitcherTests,
  'todo-list': todoListTests,
  toggle: toggleTests,
  // Add more tests as they are created
};
