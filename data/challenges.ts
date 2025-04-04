"use client"

export interface Challenge {
  id: string
  title: string
  description: string
  initialCode: string
  solutionCode: string
  solutionMarker: string // A unique string that should be in the solution
}

export const challenges: Challenge[] = [
  {
    id: "button",
    title: "1. Simple Button Component",
    description:
      "Create a button component that accepts a 'variant' prop with values 'primary' or 'secondary'. The primary button should be blue with white text, and the secondary button should be gray.",
    initialCode: `function Component() {
  // Create a Button component that accepts variant prop
  // with values "primary" or "secondary"
  
  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: `function Component() {
  const Button = ({ variant = "primary", children }) => {
    const baseStyles = "px-4 py-2 rounded font-medium";
    const variantStyles = 
      variant === "primary" 
        ? "bg-blue-500 text-white hover:bg-blue-600" 
        : "bg-gray-200 text-gray-800 hover:bg-gray-300";
    
    return (
      <button className={\`\${baseStyles} \${variantStyles}\`}>
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
    initialCode: `function Component() {
  // Create a Card component with title, content and footer
  
  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: `function Component() {
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
    initialCode: `function Component() {
  // Create a Toggle component with on/off state
  
  return (
    <div>
      {/* Your code here */}
    </div>
  );
}`,
    solutionCode: `function Component() {
  const { useState } = React;
  
  const Toggle = ({ label }) => {
    const [isOn, setIsOn] = useState(false);
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOn(!isOn)}
          className={\`relative inline-flex h-6 w-11 items-center rounded-full \${
            isOn ? 'bg-blue-600' : 'bg-gray-200'
          }\`}
        >
          <span
            className={\`inline-block h-4 w-4 transform rounded-full bg-white transition \${
              isOn ? 'translate-x-6' : 'translate-x-1'
            }\`}
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
]

