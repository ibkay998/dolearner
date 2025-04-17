"use client";

import { Challenge } from '../challenge-types';

export const reactChallenges: Challenge[] = [
  {
    id: "button",
    pathId: "react",
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
      <button className={baseStyles + " " + variantStyles}>
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
    order: 1,
  },
  {
    id: "card",
    pathId: "react",
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
    order: 2,
  },
  {
    id: "toggle",
    pathId: "react",
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
          className={"relative inline-flex h-6 w-11 items-center rounded-full " + (isOn ? "bg-blue-600" : "bg-gray-200")}
        >
          <span
            className={"inline-block h-4 w-4 transform rounded-full bg-white transition " + (isOn ? "translate-x-6" : "translate-x-1")}
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
    order: 3,
  },
  {
    id: "counter",
    pathId: "react",
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
    order: 4,
  },
  {
    id: "form",
    pathId: "react",
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
        alert("Form submitted with Name: " + name);
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
          className={"px-4 py-2 rounded text-white " + (isValid ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed")}
        >
          Submit
        </button>
      </form>
    );
  };

  return <SimpleForm />;
}`,
    solutionMarker: "!email.includes('@')",
    order: 5,
  },
  {
    id: "tabs",
    pathId: "react",
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
              className={"px-4 py-2 font-medium " + (activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700")}
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
    order: 6,
  },
  {
    id: "todo-list",
    pathId: "react",
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
    order: 7,
  },
  {
    id: "theme-switcher",
    pathId: "react",
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
      <div className={"p-6 rounded-lg shadow-md " + colors.background + " " + colors.text}>
        <h2 className="text-xl font-bold mb-4">
          Current Theme: {isDarkTheme ? 'Dark' : 'Light'}
        </h2>
        <p className="mb-4">
          This component is using the theme from React Context.
        </p>
        <button
          onClick={toggleTheme}
          className={"px-4 py-2 rounded text-white " + colors.button + " hover:opacity-90"}
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
    order: 8,
  },
  {
    id: "data-fetching",
    pathId: "react",
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
                  <span className="font-medium">{item.price}</span>
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
    order: 9,
  },
  {
    id: "custom-hook",
    pathId: "react",
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
    order: 10,
  },
];
