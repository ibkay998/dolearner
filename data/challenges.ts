"use client";
import React from 'react';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  initialCode: string;
  solutionCode: string;
  solutionMarker: string; // A unique string that should be in the solution
}

export const challenges: Challenge[] = [
  {
    id: "button",
    title: "1. Simple Button Component",
    description:
      "Create a button component that accepts a 'variant' prop with values 'primary' or 'secondary'. The primary button should be blue with white text, and the secondary button should be gray.",
    initialCode: String.raw`function Component() {
  // Create a Button component that accepts variant prop
  // with values "primary" or "secondary"

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const Button = ({ variant = "primary", children }) => {
    const baseStyles = "px-4 py-2 rounded font-medium";
    const variantStyles =
      variant === "primary"
        ? "bg-blue-500 text-white hover:bg-blue-600"
        : "bg-gray-200 text-gray-800 hover:bg-gray-300";

    return (
      <button className="baseStyles variantStyles}">
        {children}
      </button>
    );
  };

  return (
    <div className="flex gap-4">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
    </div>
  );
}`,
    solutionMarker: 'variant === "primary"',
  },
  {
    id: "card",
    title: "2. Card Component",
    description:
      "Create a Card component that accepts 'title', 'content', and 'footer' props. The card should have a border, rounded corners, and separate sections for each part.",
    initialCode: String.raw`function Component() {
  // Create a Card component with title, content and footer

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const Card = ({ title, content, footer }) => {
    return (
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="p-4">
          {content}
        </div>
        {footer && (
          <div className="p-4 border-t bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md">
      <Card
        title="Card Title"
        content={<p>This is the main content of the card.</p>}
        footer={<button className="px-4 py-2 bg-blue-500 text-white rounded">Action</button>}
      />
    </div>
  );
}`,
    solutionMarker: "border rounded-lg overflow-hidden",
  },
  {
    id: "toggle",
    title: "3. Toggle Switch",
    description:
      "Create a toggle switch component that changes state when clicked. It should visually indicate whether it's on (blue background) or off (gray background) and include a sliding animation.",
    initialCode: String.raw`function Component() {
  // Create a Toggle component with on/off state

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState } = React;

  const Toggle = ({ label }) => {
    const [isOn, setIsOn] = useState(false);

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOn(!isOn)}
          className="relative inline-flex h-6 w-11 items-center rounded-full {isOn ? 'bg-blue-600' : 'bg-gray-200'"}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition \${isOn ? 'translate-x-6' : 'translate-x-1'"}
          />
        </button>
        <span>{label} {isOn ? 'On' : 'Off'}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Toggle label="Notifications" />
      <Toggle label="Dark Mode" />
    </div>
  );
}`,
    solutionMarker: "setIsOn(!isOn)",
  },
  {
    id: "counter",
    title: "4. Counter with useState",
    description:
      "Create a counter component with increment and decrement buttons. The counter should not go below 0. Add a reset button that sets the counter back to 0.",
    initialCode: String.raw`function Component() {
  // Create a Counter component with increment, decrement, and reset

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState } = React;

  const Counter = () => {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(prev => prev > 0 ? prev - 1 : 0);
    const reset = () => setCount(0);

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-4xl font-bold">{count}</div>
        <div className="flex space-x-2">
          <button
            onClick={decrement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={increment}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return <Counter />;
}`,
    solutionMarker: "prev => prev > 0 ? prev - 1 : 0",
  },
  {
    id: "form",
    title: "5. Simple Form with Validation",
    description:
      "Create a form with name and email fields. Validate that the name is not empty and the email contains an '@' symbol. Show error messages and disable the submit button until the form is valid.",
    initialCode: String.raw`function Component() {
  // Create a form with validation for name and email

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useEffect } = React;

  const SimpleForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      // Validate name
      if (name.trim() === '') {
        setNameError('Name is required');
      } else {
        setNameError('');
      }

      // Validate email
      if (email.trim() === '') {
        setEmailError('Email is required');
      } else if (!email.includes('@')) {
        setEmailError('Email must contain @');
      } else {
        setEmailError('');
      }

      // Check if form is valid
      setIsValid(name.trim() !== '' && email.includes('@'));
    }, [name, email]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isValid) {
        alert(Form submitted with Name: });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="px-4 py-2 rounded text-white \${isValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'"
        >
          Submit
        </button>
      </form>
    );
  };

  return <SimpleForm />;
}`,
    solutionMarker: "!email.includes('@')",
  },
  {
    id: "tabs",
    title: "6. Tabs Component",
    description:
      "Create a tabs component that displays different content based on the selected tab. Include at least 3 tabs with different content.",
    initialCode: String.raw`function Component() {
  // Create a Tabs component with at least 3 tabs

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState } = React;

  const Tabs = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    const tabs = [
      { id: 'tab1', label: 'Profile', content: 'This is the profile tab content.' },
      { id: 'tab2', label: 'Settings', content: 'Configure your settings here.' },
      { id: 'tab3', label: 'Messages', content: 'You have 5 unread messages.' },
    ];

    return (
      <div className="w-full max-w-md">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 font-medium \${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500 hover:text-gray-700'"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    );
  };

  return <Tabs />;
}`,
    solutionMarker: "tabs.find(tab => tab.id === activeTab)",
  },
  {
    id: "todo-list",
    title: "7. Todo List",
    description:
      "Create a todo list component with the ability to add new todos, mark todos as completed, and delete todos. Each todo should have a text description and a completed status.",
    initialCode: String.raw`function Component() {
  // Create a Todo List component with add, complete, and delete functionality

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState } = React;

  const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');

    const addTodo = () => {
      if (newTodo.trim() === '') return;

      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    };

    const toggleTodo = (id) => {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    };

    const deleteTodo = (id) => {
      setTodos(todos.filter(todo => todo.id !== id));
    };

    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Todo List</h2>

        <div className="flex mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-l-md"
            placeholder="Add a new todo"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {todos.map(todo => (
            <li key={todo.id} className="flex items-center p-2 border rounded">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="mr-2"
              />
              <span className={todo.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-2 py-1 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No todos yet. Add one above!</p>
        )}
      </div>
    );
  };

  return <TodoList />;
}`,
    solutionMarker: "todo.id === id ? { ...todo, completed: !todo.completed } : todo",
  },
  {
    id: "theme-switcher",
    title: "8. Theme Switcher with Context",
    description:
      "Create a theme switcher using React Context. Implement a dark and light theme that affects the background and text colors of the page. Include a toggle button to switch between themes.",
    initialCode: String.raw`function Component() {
  // Create a theme switcher using React Context

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { createContext, useContext, useState } = React;

  // Create Theme Context
  const ThemeContext = createContext();

  // Theme Provider Component
  const ThemeProvider = ({ children }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const toggleTheme = () => {
      setIsDarkTheme(!isDarkTheme);
    };

    // Theme values to provide
    const theme = {
      isDarkTheme,
      toggleTheme,
      colors: {
        background: isDarkTheme ? 'bg-gray-900' : 'bg-white',
        text: isDarkTheme ? 'text-white' : 'text-gray-900',
        button: isDarkTheme ? 'bg-blue-500' : 'bg-blue-600',
      }
    };

    return (
      <ThemeContext.Provider value={theme}>
        {children}
      </ThemeContext.Provider>
    );
  };

  // Custom hook to use the theme context
  const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  };

  // Example component using the theme
  const ThemedComponent = () => {
    const { isDarkTheme, toggleTheme, colors } = useTheme();

    return (
      <div className="p-6 rounded-lg shadow-md \${colors.background} \${colors.text}\`}>
        <h2 className="text-xl font-bold mb-4">
          Current Theme: {isDarkTheme ? 'Dark' : 'Light'}
        </h2>
        <p className="mb-4">
          This component is using the theme from React Context.
        </p>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded text-white \${colors.button} hover:opacity-90\`}
        >
          Toggle Theme
        </button>
      </div>
    );
  };

  // App with ThemeProvider
  return (
    <ThemeProvider>
      <div className="max-w-md mx-auto">
        <ThemedComponent />
      </div>
    </ThemeProvider>
  );
}`,
    solutionMarker: "useContext(ThemeContext)",
  },
  {
    id: "data-fetching",
    title: "9. Data Fetching Component",
    description:
      "Create a component that fetches and displays data from a mock API. Implement loading and error states. Use the provided mockFetch function that simulates an API call with random success/failure.",
    initialCode: String.raw`function Component() {
  // This mockFetch function simulates an API call
  // It has a 70% chance of success and 30% chance of failure
  const mockFetch = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({
            success: true,
            data: [
              { id: 1, name: 'Product A', price: 29.99 },
              { id: 2, name: 'Product B', price: 19.99 },
              { id: 3, name: 'Product C', price: 39.99 },
            ]
          });
        } else {
          reject(new Error('Failed to fetch data'));
        }
      }, 1000);
    });
  };

  // Create a component that fetches and displays data
  // Handle loading and error states

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useEffect } = React;

  // This mockFetch function simulates an API call
  // It has a 70% chance of success and 30% chance of failure
  const mockFetch = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({
            success: true,
            data: [
              { id: 1, name: 'Product A', price: 29.99 },
              { id: 2, name: 'Product B', price: 19.99 },
              { id: 3, name: 'Product C', price: 39.99 },
            ]
          });
        } else {
          reject(new Error('Failed to fetch data'));
        }
      }, 1000);
    });
  };

  const DataFetchingComponent = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await mockFetch();
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    return (
      <div className="max-w-md mx-auto p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Products</h2>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <p>{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <ul className="divide-y">
              {data.map(item => (
                <li key={item.id} className="py-3 flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-medium">"item.price"</span>
                </li>
              ))}
            </ul>

            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Data
            </button>
          </>
        )}
      </div>
    );
  };

  return <DataFetchingComponent />;
}`,
    solutionMarker: "setLoading(false);",
  },
  {
    id: "custom-hook",
    title: "10. Custom Hook",
    description:
      "Create a custom hook called useLocalStorage that stores and retrieves data from localStorage. The hook should accept a key and an initial value, and return the current value and a setter function.",
    initialCode: String.raw`function Component() {
  // Create a useLocalStorage custom hook
  // It should accept a key and initial value
  // It should return [value, setValue]

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useEffect } = React;

  // Custom hook for localStorage
  const useLocalStorage = (key, initialValue) => {
    // Get stored value from localStorage or use initialValue
    const getStoredValue = () => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        console.error(error);
        return initialValue;
      }
    };

    // State to store our value
    const [value, setValue] = useState(getStoredValue);

    // Update localStorage when value changes
    useEffect(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(error);
      }
    }, [key, value]);

    return [value, setValue];
  };

  // Example usage of the custom hook
  const [name, setName] = useLocalStorage('name', '');
  const [count, setCount] = useLocalStorage('count', 0);

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Name Persisted in localStorage</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Enter your name"
          />
          <button
            onClick={() => setName('')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Counter Persisted in localStorage</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCount(count - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <span className="text-2xl font-bold">{count}</span>
          <button
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Try refreshing the page - your data will persist!
      </p>
    </div>
  );
}`,
    solutionMarker: "window.localStorage.setItem(key, JSON.stringify(value))",
  },
  {
    id: "reducer",
    title: "11. useReducer Shopping Cart",
    description:
      "Create a simple shopping cart using useReducer. Implement actions for adding items, removing items, and updating quantities. Display the cart items and total price.",
    initialCode: String.raw`function Component() {
  // Create a shopping cart using useReducer
  // Implement actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useReducer } = React;

  // Sample products data
  const products = [
    { id: 1, name: 'Keyboard', price: 59.99 },
    { id: 2, name: 'Mouse', price: 29.99 },
    { id: 3, name: 'Monitor', price: 159.99 },
  ];

  // Cart reducer
  const cartReducer = (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM': {
        const existingItem = state.find(item => item.id === action.payload.id);

        if (existingItem) {
          return state.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...state, { ...action.payload, quantity: 1 }];
        }
      }

      case 'REMOVE_ITEM':
        return state.filter(item => item.id !== action.payload);

      case 'UPDATE_QUANTITY':
        return state.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        );

      default:
        return state;
    }
  };

  // Initialize cart with useReducer
  const [cart, dispatch] = React.useReducer(cartReducer, []);

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Add item to cart
  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  // Update item quantity
  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Products</h2>
        <div className="grid grid-cols-1 gap-2">
          {products.map(product => (
            <div key={product.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-gray-500">product.price.toFixed(2)</div>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Your Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty</p>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-500">item.price.toFixed(2) each</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-2 px-2 py-1 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>totalPrice.toFixed(2)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`,
    solutionMarker: "case 'UPDATE_QUANTITY':",
  },
  {
    id: "memo",
    title: "12. Performance Optimization",
    description:
      "Create a component with a list of items and a counter. Use React.memo, useCallback, and useMemo to optimize performance by preventing unnecessary re-renders.",
    initialCode: String.raw`function Component() {
  // Create a component with a list and counter
  // Use React.memo, useCallback, and useMemo to optimize performance

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useCallback, useMemo, memo } = React;

  // Parent component with state
  const PerformanceExample = () => {
    const [count, setCount] = useState(0);
    const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
    const [text, setText] = useState('');

    // Memoized callback for adding items
    const addItem = useCallback(() => {
      if (text.trim() === '') return;
      setItems(prevItems => [...prevItems, text]);
      setText('');
    }, [text]);

    // Memoized callback for incrementing counter
    const increment = useCallback(() => {
      setCount(c => c + 1);
    }, []);

    // Memoized expensive calculation
    const expensiveCalculation = useMemo(() => {
      console.log('Performing expensive calculation...');
      return count * 2;
    }, [count]);

    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-bold mb-2">Counter Section</h2>
          <p className="mb-2">Count: {count}</p>
          <p className="mb-2">Calculated: {expensiveCalculation}</p>
          <button
            onClick={increment}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Increment
          </button>
        </div>

        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-bold mb-2">Items Section</h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-l"
              placeholder="Add new item"
            />
            <button
              onClick={addItem}
              className="px-4 py-2 bg-green-500 text-white rounded-r hover:bg-green-600"
            >
              Add
            </button>
          </div>

          <ItemList items={items} />
        </div>

        <div className="text-sm text-gray-500">
          <p>Open your browser console to see when the expensive calculation runs.</p>
          <p>Notice that ItemList doesn't re-render when only the counter changes.</p>
        </div>
      </div>
    );
  };

  // Memoized ItemList component
  const ItemList = memo(({ items }) => {
    console.log('Rendering ItemList');

    return (
      <ul className="border rounded divide-y">
        {items.map((item, index) => (
          <li key={index} className="p-2">{item}</li>
        ))}
      </ul>
    );
  });

  return <PerformanceExample />;
}`,
    solutionMarker: "const ItemList = memo(({ items })",
  },
  {
    id: "refs",
    title: "13. useRef for DOM Manipulation",
    description:
      "Create a component that uses useRef to manipulate the DOM directly. Implement a form with an input field and a button that focuses the input when clicked. Also add a button that measures and displays the input's width.",
    initialCode: String.raw`function Component() {
  // Create a component that uses useRef for DOM manipulation
  // Focus an input and measure its width

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useRef } = React;

  const DOMManipulation = () => {
    const inputRef = useRef(null);
    const [inputWidth, setInputWidth] = useState(0);

    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const measureInput = () => {
      if (inputRef.current) {
        // Get the width of the input element
        const width = inputRef.current.offsetWidth;
        setInputWidth(width);
      }
    };

    return (
      <div className="max-w-md mx-auto p-6 border rounded-lg space-y-4">
        <h2 className="text-xl font-bold mb-4">DOM Manipulation with useRef</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Input Field:</label>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-2 border rounded"
            placeholder="Type something here..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={focusInput}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Focus Input
          </button>

          <button
            onClick={measureInput}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Measure Width
          </button>
        </div>

        {inputWidth > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p>Input width: <span className="font-bold">{inputWidth}px</span></p>
          </div>
        )}

        <div className="text-sm text-gray-500 mt-4">
          <p>The Focus Input button uses useRef to directly manipulate the DOM by focusing the input element.</p>
          <p>The Measure Width button reads a property from the DOM element.</p>
        </div>
      </div>
    );
  };

  return <DOMManipulation />;
}`,
    solutionMarker: "inputRef.current.focus()",
  },
  {
    id: "custom-hooks-advanced",
    title: "14. Advanced Custom Hooks",
    description:
      "Create two custom hooks: useWindowSize to track window dimensions and useDebounce to debounce a value. Demonstrate both hooks in a component that shows the window size and debounces a search input.",
    initialCode: String.raw`function Component() {
  // Create useWindowSize and useDebounce custom hooks
  // Demonstrate them in a component

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useEffect, useCallback } = React;

  // Custom hook to track window dimensions
  const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    useEffect(() => {
      // Handler to call on window resize
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Add event listener
      window.addEventListener('resize', handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures effect is only run on mount and unmount

    return windowSize;
  };

  // Custom hook for debouncing values
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      // Set debouncedValue to value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes or unmounts
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Component that uses both custom hooks
  const AdvancedHooksDemo = () => {
    const windowSize = useWindowSize();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Simulate a search effect when debounced value changes
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
      if (debouncedSearchTerm) {
        // Simulate API call with debounced value
        console.log('Searching for:', debouncedSearchTerm);

        // Mock search results based on debounced term
        const results = [
          "Result 1 for "debouncedSearchTerm",
          "Result 2 for "debouncedSearchTerm",
          "Result 3 for "debouncedSearchTerm"",
        ];

        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, [debouncedSearchTerm]);

    return (
      <div className="max-w-md mx-auto p-6 border rounded-lg space-y-6">
        <h2 className="text-xl font-bold">Advanced Custom Hooks Demo</h2>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">useWindowSize Hook</h3>
          <p>Window width: <span className="font-bold">{windowSize.width}px</span></p>
          <p>Window height: <span className="font-bold">{windowSize.height}px</span></p>
          <p className="text-sm text-gray-500 mt-2">Resize your browser window to see values change.</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">useDebounce Hook</h3>
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div>
            <p className="mb-2">Current: <span className="font-medium">{searchTerm}</span></p>
            <p className="mb-2">Debounced: <span className="font-medium">{debouncedSearchTerm}</span></p>

            {searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Search Results:</h4>
                <ul className="list-disc pl-5">
                  {searchResults.map((result, index) => (
                    <li key={index}>{result}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2">
              The search is debounced by 500ms to prevent excessive API calls while typing.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return <AdvancedHooksDemo />;
}`,
    solutionMarker: "const useDebounce = (value, delay)",
  },
  {
    id: "router",
    title: "15. Simple Router",
    description:
      "Create a simple router implementation that allows navigation between different pages without page reloads. Implement a Home page, About page, and Contact page with navigation links.",
    initialCode: String.raw`function Component() {
  // Create a simple router with Home, About, and Contact pages

  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  const { useState, useEffect } = React;

  // Simple Router Implementation
  const Router = () => {
    // State to track current route
    const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/home');

    // Update path when hash changes
    useEffect(() => {
      const handleHashChange = () => {
        const path = window.location.hash.slice(1) || '/home';
        setCurrentPath(path);
      };

      window.addEventListener('hashchange', handleHashChange);

      // Set initial hash if not present
      if (!window.location.hash) {
        window.location.hash = '#/home';
      }

      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Navigate to a new route
    const navigate = (path) => {
      window.location.hash = path;
    };

    // Page Components
    const HomePage = () => (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Home Page</h2>
        <p className="mb-4">Welcome to our simple router implementation!</p>
        <p>This is the home page of our application. Use the navigation links above to explore other pages.</p>
      </div>
    );

    const AboutPage = () => (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">About Page</h2>
        <p className="mb-4">This is a simple router implementation using React hooks.</p>
        <p>It uses window.location.hash to track the current route and updates the UI accordingly without page reloads.</p>
      </div>
    );

    const ContactPage = () => (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Contact Page</h2>
        <p className="mb-4">Get in touch with us!</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea className="w-full px-3 py-2 border rounded" rows="4"></textarea>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => alert('Form submission is just a demo!')}
          >
            Send Message
          </button>
        </form>
      </div>
    );

    const NotFoundPage = () => (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
        <p className="mb-4">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    );

    // Render the appropriate component based on the current path
    const renderContent = () => {
      switch (currentPath) {
        case '/home':
          return <HomePage />;
        case '/about':
          return <AboutPage />;
        case '/contact':
          return <ContactPage />;
        default:
          return <NotFoundPage />;
      }
    };

    return (
      <div className="max-w-2xl mx-auto border rounded-lg overflow-hidden shadow-sm">
        {/* Navigation */}
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <a
                href="#/home"
                className="px-3 py-2 rounded hover:bg-gray-700 \${currentPath === '/home' ? 'bg-gray-700' : ''"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#/about"
                className="px-3 py-2 rounded hover:bg-gray-700 \${currentPath === '/about' ? 'bg-gray-700' : ''"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#/contact"
                className="px-3 py-2 rounded hover:bg-gray-700 \${currentPath === '/contact' ? 'bg-gray-700' : ''"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Content area */}
        <div className="bg-white">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          <p>Simple Router Implementation - React Practice</p>
        </footer>
      </div>
    );
  };

  return <Router />;
}`,
    solutionMarker: "window.addEventListener('hashchange', handleHashChange)",
  },
];
