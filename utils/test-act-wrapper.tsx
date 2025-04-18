/**
 * This utility provides a consistent way to use act() across the codebase
 * It handles the differences between React 19's act() and @testing-library/react's act()
 */

import { act as testingLibraryAct } from '@testing-library/react';

/**
 * Wraps a function in act() to ensure all updates are processed
 * This is compatible with React 19 and @testing-library/react
 * 
 * @param callback The function to wrap in act()
 * @returns A promise that resolves when act() is complete
 */
export async function actWrapper<T>(callback: () => T | Promise<T>): Promise<T> {
  let result: T;
  await testingLibraryAct(async () => {
    result = await callback();
  });
  return result!;
}
