// Define the Button component with TypeScript-like prop types
const Button = ({ variant = "primary", children }) => {
  // Base styles for all buttons
  const baseStyles = "px-4 py-2 rounded font-medium";
  
  // Variant-specific styles - explicitly handle both primary and secondary cases
  let variantStyles = "";
  if (variant === "primary") {
    variantStyles = "bg-blue-500 text-white hover:bg-blue-600";
  } else if (variant === "secondary") {
    variantStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  } else {
    // Fallback to primary if an unknown variant is provided
    variantStyles = "bg-blue-500 text-white hover:bg-blue-600";
  }

  // Combine styles using template literals for better readability
  return (
    <button className={`${baseStyles} ${variantStyles}`}>
      {children}
    </button>
  );
};

// Render the component with both variants
return (
  <div className="flex gap-4">
    <Button variant="primary">Primary Button</Button>
    <Button variant="secondary">Secondary Button</Button>
  </div>
);
