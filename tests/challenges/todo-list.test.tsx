import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TestResult } from '@/utils/test-utils';

export const todoListTests = [
  // Test 1: Check if the todo list component exists
  async (Component: any): Promise<TestResult> => {
    try {
      // Clean up any previous renders
      cleanup();
      
      const { container } = render(<Component />);
      
      // Look for a list-like structure
      const listElements = container.querySelectorAll('ul, ol, div[role="list"]');
      
      if (listElements.length === 0) {
        return {
          pass: false,
          message: 'No list elements found. Make sure you create a todo list component with a list structure.',
        };
      }
      
      return {
        pass: true,
        message: 'Todo list component found.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error rendering component: ${error.message}`,
      };
    }
  },
  
  // Test 2: Check if there's an input to add new todos
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Look for an input field
      const inputField = container.querySelector('input[type="text"]') || 
                         container.querySelector('input:not([type])') ||
                         container.querySelector('textarea');
      
      if (!inputField) {
        return {
          pass: false,
          message: 'No input field found for adding new todos. Make sure your todo list has an input for adding new items.',
        };
      }
      
      // Look for an add button
      const addButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('add') ||
        button.textContent?.includes('+') ||
        button.getAttribute('aria-label')?.toLowerCase().includes('add')
      );
      
      if (!addButton) {
        return {
          pass: false,
          message: 'No add button found. Make sure your todo list has a button to add new items.',
        };
      }
      
      return {
        pass: true,
        message: 'Todo list has an input field and add button.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing input field: ${error.message}`,
      };
    }
  },
  
  // Test 3: Check if new todos can be added
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find the input field
      const inputField = container.querySelector('input[type="text"]') || 
                         container.querySelector('input:not([type])') ||
                         container.querySelector('textarea');
      
      if (!inputField) {
        return {
          pass: false,
          message: 'No input field found for adding new todos.',
        };
      }
      
      // Find the add button
      const addButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('add') ||
        button.textContent?.includes('+') ||
        button.getAttribute('aria-label')?.toLowerCase().includes('add')
      );
      
      if (!addButton) {
        return {
          pass: false,
          message: 'No add button found.',
        };
      }
      
      // Count initial number of todo items
      const initialTodoCount = container.querySelectorAll('li, .todo-item, [class*="todo-item"]').length;
      
      // Add a new todo
      const todoText = 'Test todo item';
      fireEvent.change(inputField, { target: { value: todoText } });
      fireEvent.click(addButton);
      
      // Count new number of todo items
      const newTodoCount = container.querySelectorAll('li, .todo-item, [class*="todo-item"]').length;
      
      if (newTodoCount <= initialTodoCount) {
        return {
          pass: false,
          message: 'No new todo item was added after clicking the add button. Make sure your todo list can add new items.',
        };
      }
      
      // Check if the new todo contains the text we entered
      const todoItems = container.querySelectorAll('li, .todo-item, [class*="todo-item"]');
      const newTodoAdded = Array.from(todoItems).some(item => 
        item.textContent?.includes(todoText)
      );
      
      if (!newTodoAdded) {
        return {
          pass: false,
          message: 'A new todo item was added, but it does not contain the text that was entered.',
        };
      }
      
      return {
        pass: true,
        message: 'Todo list can add new items successfully.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing adding todos: ${error.message}`,
      };
    }
  },
  
  // Test 4: Check if todos can be marked as completed
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find the input field and add button
      const inputField = container.querySelector('input[type="text"]') || 
                         container.querySelector('input:not([type])') ||
                         container.querySelector('textarea');
      const addButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('add') ||
        button.textContent?.includes('+') ||
        button.getAttribute('aria-label')?.toLowerCase().includes('add')
      );
      
      // Add a new todo if there are no todos
      if (container.querySelectorAll('li, .todo-item, [class*="todo-item"]').length === 0 && inputField && addButton) {
        fireEvent.change(inputField, { target: { value: 'Test todo for completion' } });
        fireEvent.click(addButton);
      }
      
      // Find todo items
      const todoItems = container.querySelectorAll('li, .todo-item, [class*="todo-item"]');
      
      if (todoItems.length === 0) {
        return {
          pass: false,
          message: 'No todo items found to test completion functionality.',
        };
      }
      
      // Find a checkbox or completion element in the first todo item
      const firstTodo = todoItems[0];
      const checkbox = firstTodo.querySelector('input[type="checkbox"]');
      
      // If there's no checkbox, look for a button or element that might be used for completion
      if (!checkbox) {
        const completionElement = firstTodo.querySelector('button, .complete, .check, [class*="complete"], [class*="check"]');
        
        if (!completionElement) {
          return {
            pass: false,
            message: 'No checkbox or completion element found in todo items. Make sure your todo list allows marking items as completed.',
          };
        }
        
        // Click the completion element
        fireEvent.click(completionElement);
      } else {
        // Click the checkbox
        fireEvent.click(checkbox);
      }
      
      // Check if the todo item has a completed class or style
      const isCompleted = firstTodo.className.includes('completed') || 
                         firstTodo.className.includes('done') ||
                         firstTodo.style.textDecoration === 'line-through' ||
                         (checkbox && checkbox.checked);
      
      if (!isCompleted) {
        return {
          pass: false,
          message: 'Todo item does not appear to be marked as completed after clicking the completion element.',
        };
      }
      
      return {
        pass: true,
        message: 'Todo list can mark items as completed.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing todo completion: ${error.message}`,
      };
    }
  },
  
  // Test 5: Check if todos can be deleted
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Find the input field and add button
      const inputField = container.querySelector('input[type="text"]') || 
                         container.querySelector('input:not([type])') ||
                         container.querySelector('textarea');
      const addButton = Array.from(container.querySelectorAll('button')).find(button => 
        button.textContent?.toLowerCase().includes('add') ||
        button.textContent?.includes('+') ||
        button.getAttribute('aria-label')?.toLowerCase().includes('add')
      );
      
      // Add a new todo if there are no todos
      if (container.querySelectorAll('li, .todo-item, [class*="todo-item"]').length === 0 && inputField && addButton) {
        fireEvent.change(inputField, { target: { value: 'Test todo for deletion' } });
        fireEvent.click(addButton);
      }
      
      // Find todo items
      const todoItems = container.querySelectorAll('li, .todo-item, [class*="todo-item"]');
      
      if (todoItems.length === 0) {
        return {
          pass: false,
          message: 'No todo items found to test deletion functionality.',
        };
      }
      
      // Count initial number of todo items
      const initialTodoCount = todoItems.length;
      
      // Find a delete button in the first todo item
      const firstTodo = todoItems[0];
      const deleteButton = firstTodo.querySelector('button.delete, button.remove, button[aria-label*="delete" i], button[aria-label*="remove" i]') ||
                          Array.from(firstTodo.querySelectorAll('button')).find(button => 
                            button.textContent?.includes('×') ||
                            button.textContent?.includes('✕') ||
                            button.textContent?.toLowerCase().includes('delete') ||
                            button.textContent?.toLowerCase().includes('remove')
                          );
      
      if (!deleteButton) {
        return {
          pass: false,
          message: 'No delete button found in todo items. Make sure your todo list allows deleting items.',
        };
      }
      
      // Click the delete button
      fireEvent.click(deleteButton);
      
      // Count new number of todo items
      const newTodoCount = container.querySelectorAll('li, .todo-item, [class*="todo-item"]').length;
      
      if (newTodoCount >= initialTodoCount) {
        return {
          pass: false,
          message: 'Todo item was not deleted after clicking the delete button.',
        };
      }
      
      return {
        pass: true,
        message: 'Todo list can delete items successfully.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing todo deletion: ${error.message}`,
      };
    }
  },
  
  // Test 6: Check if the todo list has proper styling
  async (Component: any): Promise<TestResult> => {
    try {
      cleanup();
      const { container } = render(<Component />);
      
      // Check if the todo list container has styling
      const todoListContainer = container.querySelector('ul, ol, div[role="list"]') || container;
      
      const hasContainerStyling = todoListContainer.className.includes('p-') || 
                                 todoListContainer.className.includes('m-') || 
                                 todoListContainer.className.includes('border') ||
                                 todoListContainer.className.includes('bg-') ||
                                 todoListContainer.className.includes('shadow') ||
                                 todoListContainer.className.includes('rounded');
      
      if (!hasContainerStyling) {
        return {
          pass: false,
          message: 'Todo list container lacks proper styling. Consider adding padding, margins, borders, or background colors.',
        };
      }
      
      // Check if todo items have styling
      const todoItems = container.querySelectorAll('li, .todo-item, [class*="todo-item"]');
      
      if (todoItems.length > 0) {
        const hasItemStyling = Array.from(todoItems).some(item => 
          item.className.includes('p-') || 
          item.className.includes('m-') || 
          item.className.includes('border') ||
          item.className.includes('bg-') ||
          item.className.includes('flex')
        );
        
        if (!hasItemStyling) {
          return {
            pass: false,
            message: 'Todo items lack proper styling. Consider adding padding, margins, borders, or flex layout.',
          };
        }
      }
      
      return {
        pass: true,
        message: 'Todo list has proper styling.',
      };
    } catch (error:any) {
      return {
        pass: false,
        message: `Error testing todo list styling: ${error.message}`,
      };
    }
  },
];
