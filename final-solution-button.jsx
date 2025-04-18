// Define the Button component
const Button = ({ variant = "primary", children }) => {
  // Base styles for all buttons
  const baseStyles = "px-4 py-2 rounded font-medium";
  
  // Variant-specific styles
  let variantStyles = "";
  
  // Explicitly check for each variant to ensure test compatibility
  if (variant === "primary") {
    variantStyles = "bg-blue-500 text-white hover:bg-blue-600";
  } else if (variant === "secondary") {
    variantStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  }

  return (
    <button className={`${baseStyles} ${variantStyles}`}>
      {children}
    </button>
  );
};

// Component function that returns the UI with both button variants
// This is what will be rendered when the component is used
return (
  <div className="flex gap-4">
    <Button variant="primary">Primary Button</Button>
    <Button variant="secondary">Secondary Button</Button>
  </div>
);
