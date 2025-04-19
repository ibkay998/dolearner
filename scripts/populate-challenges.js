require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Comprehensive challenges with detailed test cases
const sampleChallenges = [
  {
    id: "button",
    path_id: "react",
    title: "1. Button Component",
    description: "Create a button component with primary and secondary variants. The button should have appropriate styling and respond to user interactions.",
    initial_code: "function Component() {\n  // Create a button component\n  // It should have a className for styling\n  // It should display some text\n  return <div>Button</div>;\n}",
    solution_code: "function Component() {\n  return (\n    <button \n      className=\"primary\"\n      onClick={() => console.log('Button clicked!')}\n    >\n      Click me\n    </button>\n  );\n}",
    solution_marker: "button",
    order_num: 1
  },
  {
    id: "card",
    path_id: "react",
    title: "2. Card Component",
    description: "Create a card component with a title, content area, and optional footer. The card should have appropriate styling and structure.",
    initial_code: "function Component() {\n  // Create a card component\n  // It should have a title (h2 or h3)\n  // It should have a content area\n  // It should have appropriate styling\n  return <div>Card</div>;\n}",
    solution_code: "function Component() {\n  return (\n    <div className=\"card\">\n      <h2 className=\"card-title\">Card Title</h2>\n      <div className=\"card-content\">\n        <p>This is the card content. You can put any elements here.</p>\n      </div>\n      <div className=\"card-footer\">\n        <button>Action</button>\n      </div>\n    </div>\n  );\n}",
    solution_marker: "card",
    order_num: 2
  },
  {
    id: "counter",
    path_id: "react",
    title: "3. Counter Component",
    description: "Create a counter component with increment and decrement buttons. The component should use React's useState hook to manage the counter state.",
    initial_code: "function Component() {\n  // Create a counter component\n  // Use React.useState to manage the counter value\n  // Include buttons to increment and decrement the counter\n  // Display the current count\n  return <div>Counter</div>;\n}",
    solution_code: "function Component() {\n  const [count, setCount] = React.useState(0);\n  \n  const increment = () => setCount(count + 1);\n  const decrement = () => setCount(count - 1);\n  \n  return (\n    <div className=\"counter\">\n      <h2>Counter: {count}</h2>\n      <div className=\"counter-controls\">\n        <button onClick={decrement}>-</button>\n        <span className=\"counter-value\">{count}</span>\n        <button onClick={increment}>+</button>\n      </div>\n    </div>\n  );\n}",
    solution_marker: "useState",
    order_num: 3
  },
  {
    id: "data-fetching",
    path_id: "react",
    title: "4. Data Fetching Component",
    description: "Create a component that fetches data from an API and displays it. Handle loading and error states appropriately.",
    initial_code: "function Component() {\n  // Create a component that fetches and displays data\n  // Use React.useState to manage data, loading, and error states\n  // Use React.useEffect to trigger the data fetching\n  // Handle loading and error states\n  // Display the fetched data\n  return <div>Data Fetching</div>;\n}",
    solution_code: "function Component() {\n  const [data, setData] = React.useState(null);\n  const [loading, setLoading] = React.useState(true);\n  const [error, setError] = React.useState(null);\n  \n  React.useEffect(() => {\n    const fetchData = async () => {\n      try {\n        // For demo purposes, we'll simulate a fetch with a timeout\n        // In a real app, you would use fetch() to call an actual API\n        setTimeout(() => {\n          setData([\n            { id: 1, name: 'Item 1' },\n            { id: 2, name: 'Item 2' },\n            { id: 3, name: 'Item 3' }\n          ]);\n          setLoading(false);\n        }, 1000);\n      } catch (err) {\n        setError('Failed to fetch data');\n        setLoading(false);\n      }\n    };\n    \n    fetchData();\n  }, []);\n  \n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error}</div>;\n  \n  return (\n    <div className=\"data-container\">\n      <h2>Data Items</h2>\n      <ul>\n        {data && data.map(item => (\n          <li key={item.id}>{item.name}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}",
    solution_marker: "useEffect",
    order_num: 4
  },
  {
    id: "form",
    path_id: "react",
    title: "5. Form Component",
    description: "Create a form component with input fields and validation. The form should handle user input and form submission.",
    initial_code: "function Component() {\n  // Create a form component\n  // Use React.useState to manage form data\n  // Include input fields (name, email)\n  // Handle form submission\n  // Implement basic validation\n  return <div>Form</div>;\n}",
    solution_code: "function Component() {\n  const [formData, setFormData] = React.useState({\n    name: '',\n    email: ''\n  });\n  const [errors, setErrors] = React.useState({});\n  const [submitted, setSubmitted] = React.useState(false);\n  \n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value\n    }));\n  };\n  \n  const validate = () => {\n    const newErrors = {};\n    if (!formData.name) newErrors.name = 'Name is required';\n    if (!formData.email) newErrors.email = 'Email is required';\n    else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {\n      newErrors.email = 'Email is invalid';\n    }\n    return newErrors;\n  };\n  \n  const handleSubmit = (e) => {\n    e.preventDefault();\n    const newErrors = validate();\n    if (Object.keys(newErrors).length > 0) {\n      setErrors(newErrors);\n    } else {\n      setErrors({});\n      setSubmitted(true);\n      // In a real app, you would submit the form data to a server here\n      console.log('Form submitted:', formData);\n    }\n  };\n  \n  if (submitted) {\n    return (\n      <div className=\"success-message\">\n        <h2>Form Submitted Successfully!</h2>\n        <p>Thank you, {formData.name}!</p>\n        <button onClick={() => {\n          setFormData({ name: '', email: '' });\n          setSubmitted(false);\n        }}>\n          Submit Another\n        </button>\n      </div>\n    );\n  }\n  \n  return (\n    <form onSubmit={handleSubmit} className=\"form\">\n      <h2>Contact Form</h2>\n      \n      <div className=\"form-group\">\n        <label htmlFor=\"name\">Name:</label>\n        <input\n          type=\"text\"\n          id=\"name\"\n          name=\"name\"\n          value={formData.name}\n          onChange={handleChange}\n          className={errors.name ? 'error' : ''}\n        />\n        {errors.name && <span className=\"error-message\">{errors.name}</span>}\n      </div>\n      \n      <div className=\"form-group\">\n        <label htmlFor=\"email\">Email:</label>\n        <input\n          type=\"email\"\n          id=\"email\"\n          name=\"email\"\n          value={formData.email}\n          onChange={handleChange}\n          className={errors.email ? 'error' : ''}\n        />\n        {errors.email && <span className=\"error-message\">{errors.email}</span>}\n      </div>\n      \n      <button type=\"submit\" className=\"submit-button\">\n        Submit\n      </button>\n    </form>\n  );\n}",
    solution_marker: "onSubmit",
    order_num: 5
  },
  {
    id: "tabs",
    path_id: "react",
    title: "6. Tabs Component",
    description: "Create a tabs component with multiple tab panels. The component should allow users to switch between different content panels.",
    initial_code: "function Component() {\n  // Create a tabs component\n  // Use React.useState to track the active tab\n  // Create tab buttons/headers\n  // Create tab panels with content\n  // Show only the active tab's content\n  return <div>Tabs</div>;\n}",
    solution_code: "function Component() {\n  const [activeTab, setActiveTab] = React.useState('tab1');\n  \n  const handleTabClick = (tab) => {\n    setActiveTab(tab);\n  };\n  \n  return (\n    <div className=\"tabs-container\">\n      <div className=\"tabs-header\">\n        <button\n          className={`tab-button ${activeTab === 'tab1' ? 'active' : ''}\`}\n          onClick={() => handleTabClick('tab1')}\n        >\n          Tab 1\n        </button>\n        <button\n          className={`tab-button ${activeTab === 'tab2' ? 'active' : ''}\`}\n          onClick={() => handleTabClick('tab2')}\n        >\n          Tab 2\n        </button>\n        <button\n          className={`tab-button ${activeTab === 'tab3' ? 'active' : ''}\`}\n          onClick={() => handleTabClick('tab3')}\n        >\n          Tab 3\n        </button>\n      </div>\n      \n      <div className=\"tab-content\">\n        {activeTab === 'tab1' && (\n          <div className=\"tab-panel\">\n            <h3>Tab 1 Content</h3>\n            <p>This is the content for Tab 1.</p>\n          </div>\n        )}\n        \n        {activeTab === 'tab2' && (\n          <div className=\"tab-panel\">\n            <h3>Tab 2 Content</h3>\n            <p>This is the content for Tab 2.</p>\n          </div>\n        )}\n        \n        {activeTab === 'tab3' && (\n          <div className=\"tab-panel\">\n            <h3>Tab 3 Content</h3>\n            <p>This is the content for Tab 3.</p>\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}",
    solution_marker: "setActiveTab",
    order_num: 6
  },
  {
    id: "theme-switcher",
    path_id: "react",
    title: "7. Theme Switcher",
    description: "Create a theme switcher component that toggles between light and dark themes. The component should apply different styles based on the selected theme.",
    initial_code: "function Component() {\n  // Create a theme switcher component\n  // Use React.useState to track the current theme (light/dark)\n  // Create a toggle button to switch themes\n  // Apply different styles based on the current theme\n  return <div>Theme Switcher</div>;\n}",
    solution_code: "function Component() {\n  const [theme, setTheme] = React.useState('light');\n  \n  const toggleTheme = () => {\n    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');\n  };\n  \n  // Define theme-specific styles\n  const themeStyles = {\n    container: {\n      backgroundColor: theme === 'light' ? '#ffffff' : '#333333',\n      color: theme === 'light' ? '#333333' : '#ffffff',\n      padding: '20px',\n      borderRadius: '8px',\n      transition: 'all 0.3s ease'\n    },\n    button: {\n      backgroundColor: theme === 'light' ? '#0070f3' : '#f0db4f',\n      color: theme === 'light' ? '#ffffff' : '#333333',\n      border: 'none',\n      padding: '10px 20px',\n      borderRadius: '4px',\n      cursor: 'pointer'\n    }\n  };\n  \n  return (\n    <div style={themeStyles.container} className={`theme-container ${theme}`}>\n      <h2>Current Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</h2>\n      <p>\n        This component demonstrates theme switching functionality.\n        The styles change based on the selected theme.\n      </p>\n      <button\n        onClick={toggleTheme}\n        style={themeStyles.button}\n        className=\"theme-toggle\"\n      >\n        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme\n      </button>\n    </div>\n  );\n}",
    solution_marker: "setTheme",
    order_num: 7
  },
  {
    id: "todo-list",
    path_id: "react",
    title: "8. Todo List",
    description: "Create a todo list component that allows users to add, toggle, and delete todos. The component should manage the list of todos using React's useState hook.",
    initial_code: "function Component() {\n  // Create a todo list component\n  // Use React.useState to manage the list of todos\n  // Include functionality to add new todos\n  // Include functionality to toggle todo completion\n  // Include functionality to delete todos\n  // Display the list of todos\n  return <div>Todo List</div>;\n}",
    solution_code: "function Component() {\n  const [todos, setTodos] = React.useState([\n    { id: 1, text: 'Learn React', completed: false },\n    { id: 2, text: 'Build a todo app', completed: true }\n  ]);\n  const [newTodoText, setNewTodoText] = React.useState('');\n  \n  const addTodo = (e) => {\n    e.preventDefault();\n    if (!newTodoText.trim()) return;\n    \n    const newTodo = {\n      id: Date.now(),\n      text: newTodoText,\n      completed: false\n    };\n    \n    setTodos([...todos, newTodo]);\n    setNewTodoText('');\n  };\n  \n  const toggleTodo = (id) => {\n    setTodos(todos.map(todo => \n      todo.id === id ? { ...todo, completed: !todo.completed } : todo\n    ));\n  };\n  \n  const deleteTodo = (id) => {\n    setTodos(todos.filter(todo => todo.id !== id));\n  };\n  \n  return (\n    <div className=\"todo-app\">\n      <h2>Todo List</h2>\n      \n      <form onSubmit={addTodo} className=\"todo-form\">\n        <input\n          type=\"text\"\n          value={newTodoText}\n          onChange={(e) => setNewTodoText(e.target.value)}\n          placeholder=\"Add a new todo\"\n          className=\"todo-input\"\n        />\n        <button type=\"submit\" className=\"add-button\">Add</button>\n      </form>\n      \n      <ul className=\"todo-list\">\n        {todos.length === 0 ? (\n          <li className=\"empty-message\">No todos yet! Add one above.</li>\n        ) : (\n          todos.map(todo => (\n            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}\`}>\n              <input\n                type=\"checkbox\"\n                checked={todo.completed}\n                onChange={() => toggleTodo(todo.id)}\n                className=\"todo-checkbox\"\n              />\n              <span className=\"todo-text\">{todo.text}</span>\n              <button\n                onClick={() => deleteTodo(todo.id)}\n                className=\"delete-button\"\n              >\n                Delete\n              </button>\n            </li>\n          ))\n        )}\n      </ul>\n      \n      <div className=\"todo-stats\">\n        <p>Total: {todos.length}</p>\n        <p>Completed: {todos.filter(todo => todo.completed).length}</p>\n      </div>\n    </div>\n  );\n}",
    solution_marker: "setTodos",
    order_num: 8
  },
  {
    id: "toggle",
    path_id: "react",
    title: "9. Toggle Component",
    description: "Create a toggle component that switches between on and off states. The component should provide visual feedback based on its current state.",
    initial_code: "function Component() {\n  // Create a toggle component\n  // Use React.useState to track the toggle state (on/off)\n  // Create a button or control to toggle the state\n  // Provide visual feedback based on the current state\n  return <div>Toggle</div>;\n}",
    solution_code: "function Component() {\n  const [isOn, setIsOn] = React.useState(false);\n  \n  const toggle = () => {\n    setIsOn(prevState => !prevState);\n  };\n  \n  const toggleStyles = {\n    container: {\n      display: 'flex',\n      flexDirection: 'column',\n      alignItems: 'center',\n      gap: '10px'\n    },\n    toggle: {\n      width: '60px',\n      height: '30px',\n      backgroundColor: isOn ? '#4CAF50' : '#ccc',\n      borderRadius: '15px',\n      position: 'relative',\n      cursor: 'pointer',\n      transition: 'background-color 0.3s ease'\n    },\n    slider: {\n      position: 'absolute',\n      top: '3px',\n      left: isOn ? '33px' : '3px',\n      width: '24px',\n      height: '24px',\n      backgroundColor: '#fff',\n      borderRadius: '50%',\n      transition: 'left 0.3s ease'\n    },\n    status: {\n      fontWeight: 'bold',\n      color: isOn ? '#4CAF50' : '#666'\n    }\n  };\n  \n  return (\n    <div style={toggleStyles.container} className=\"toggle-container\">\n      <h2>Toggle Switch</h2>\n      \n      <div\n        style={toggleStyles.toggle}\n        onClick={toggle}\n        className={`toggle-switch ${isOn ? 'on' : 'off'}\`}\n      >\n        <div\n          style={toggleStyles.slider}\n          className=\"toggle-slider\"\n        />\n      </div>\n      \n      <p style={toggleStyles.status} className=\"toggle-status\">\n        Status: {isOn ? 'ON' : 'OFF'}\n      </p>\n      \n      <button onClick={toggle} className=\"toggle-button\">\n        {isOn ? 'Turn Off' : 'Turn On'}\n      </button>\n    </div>\n  );\n}",
    solution_marker: "setIsOn",
    order_num: 9
  },
  {
    id: "box-model",
    path_id: "css",
    title: "1. Box Model Basics",
    description: "Create a box with specific dimensions, padding, border, and margin to demonstrate the CSS box model.",
    initial_code: "function Component() {\n  // Create a div with specific box model properties\n  // Set width, height, padding, border, and margin\n  return <div style={{}}>Box Model</div>;\n}",
    solution_code: "function Component() {\n  const boxStyle = {\n    width: '200px',\n    height: '100px',\n    padding: '20px',\n    border: '5px solid #3498db',\n    margin: '30px',\n    backgroundColor: '#ecf0f1',\n    color: '#2c3e50',\n    textAlign: 'center',\n    fontWeight: 'bold',\n    display: 'flex',\n    alignItems: 'center',\n    justifyContent: 'center'\n  };\n  \n  return (\n    <div style={boxStyle} className=\"box-model-demo\">\n      Box Model Demo\n    </div>\n  );\n}",
    solution_marker: "padding",
    order_num: 1
  }
];

// Create a Supabase client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateChallenges() {
  console.log('Starting to populate challenges...');
  console.log('Using Supabase URL:', supabaseUrl);

  try {
    // Insert challenges into the database
    const { data, error } = await supabase
      .from('challenges')
      .upsert(sampleChallenges, {
        onConflict: 'id'
      });

    if (error) {
      throw error;
    }

    console.log(`Successfully populated ${sampleChallenges.length} sample challenges!`);
    return { success: true, count: sampleChallenges.length };
  } catch (error) {
    console.error('Error populating challenges:', error);
    return { success: false, error };
  }
}

// Run the function
populateChallenges()
  .then(result => {
    if (result.success) {
      console.log('Challenges population completed successfully!');
      process.exit(0);
    } else {
      console.error('Failed to populate challenges:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
