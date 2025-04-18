// Define the Button component
const Button = ({ variant = "primary", children }) => {
  // Base styles for all buttons
  const baseStyles = "px-4 py-2 rounded font-medium";
  
  // Variant-specific styles
  const variantStyles =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  // Combine styles
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
