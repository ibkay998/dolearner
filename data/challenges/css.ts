"use client";

import { Challenge } from '../challenge-types';

export const cssChallenges: Challenge[] = [
  {
    id: "box-model",
    pathId: "css",
    title: "1. Box Model Basics",
    description:
      "Create a box with specific dimensions, padding, border, and margin. The box should have a width of 200px, padding of 20px, a 2px solid border, and a margin of 30px.",
    initialCode: String.raw`function Component() {
  // The CSS challenge is applied to this component
  // Modify the style object below
  const styles = {
    box: {
      /* Your code here */
    }
  };

  return (
    <div style={styles.box}>
      This is a box with specific dimensions.
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  // The CSS challenge is applied to this component
  // Modify the style object below
  const styles = {
    box: {
      width: "200px",
      padding: "20px",
      border: "2px solid #333",
      margin: "30px",
      backgroundColor: "#f0f0f0",
      color: "#333"
    }
  };

  return (
    <div style={styles.box}>
      This is a box with specific dimensions.
    </div>
  );
}`,
    solutionMarker: "padding: \"20px\"",
    order: 1,
  },
  {
    id: "flexbox-layout",
    pathId: "css",
    title: "2. Flexbox Layout",
    description:
      "Create a navigation bar using flexbox. The navigation should have a logo on the left and navigation links on the right. The navigation links should be evenly spaced.",
    initialCode: String.raw`function Component() {
  // The CSS challenge is applied to this component
  // Modify the style objects below to create a flexbox navbar
  const styles = {
    navbar: {
      /* Your code here */
    },
    logo: {
      /* Your code here */
    },
    navLinks: {
      /* Your code here */
    },
    navLink: {
      /* Your code here */
    }
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.logo}>Logo</div>
      <div style={styles.navLinks}>
        <a href="#" style={styles.navLink}>Home</a>
        <a href="#" style={styles.navLink}>About</a>
        <a href="#" style={styles.navLink}>Services</a>
        <a href="#" style={styles.navLink}>Contact</a>
      </div>
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  // The CSS challenge is applied to this component
  // Modify the style objects below to create a flexbox navbar
  const styles = {
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: "#333",
      color: "white"
    },
    logo: {
      fontWeight: "bold",
      fontSize: "1.5rem"
    },
    navLinks: {
      display: "flex",
      gap: "1rem"
    },
    navLink: {
      color: "white",
      textDecoration: "none",
      padding: "0.5rem",
      borderRadius: "4px",
      transition: "background-color 0.2s"
    }
  };

  // Add hover effect with JavaScript since inline styles don't support :hover
  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = "transparent";
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.logo}>Logo</div>
      <div style={styles.navLinks}>
        <a
          href="#"
          style={styles.navLink}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >Home</a>
        <a
          href="#"
          style={styles.navLink}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >About</a>
        <a
          href="#"
          style={styles.navLink}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >Services</a>
        <a
          href="#"
          style={styles.navLink}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >Contact</a>
      </div>
    </div>
  );
}`,
    solutionMarker: "display: \"flex\"",
    order: 2,
  },
  {
    id: "responsive-grid",
    pathId: "css",
    title: "3. Responsive Grid",
    description:
      "Create a responsive grid layout with CSS Grid. The grid should have 3 columns on desktop, 2 columns on tablet, and 1 column on mobile. Use the window.innerWidth to detect screen size and adjust the grid accordingly.",
    initialCode: String.raw`function Component() {
  // The CSS challenge is applied to this component
  // Use React hooks to create a responsive grid
  const { useState, useEffect } = React;

  // State to track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine number of columns based on window width
  // Your code here: modify this function to return the correct number of columns
  const getColumns = () => {
    // Default to 3 columns
    return 3;
  };

  // Create grid styles based on column count
  const getGridStyle = () => {
    return {
      display: "grid",
      gridTemplateColumns: getColumns() === 1 ? "1fr" :
                          getColumns() === 2 ? "1fr 1fr" :
                          "1fr 1fr 1fr",
      gap: "1rem",
      padding: "1rem"
    };
  };

  const styles = {
    gridItem: {
      backgroundColor: "#f0f0f0",
      padding: "2rem",
      textAlign: "center",
      borderRadius: "4px"
    },
    info: {
      marginBottom: "1rem",
      fontSize: "0.9rem",
      color: "#666"
    }
  };

  return (
    <div>
      <div style={styles.info}>
        Current window width: {windowWidth}px | Columns: {getColumns()}
        <br />
        <small>Resize your browser window to see the grid change</small>
      </div>
      <div style={getGridStyle()}>
        <div style={styles.gridItem}>Item 1</div>
        <div style={styles.gridItem}>Item 2</div>
        <div style={styles.gridItem}>Item 3</div>
        <div style={styles.gridItem}>Item 4</div>
        <div style={styles.gridItem}>Item 5</div>
        <div style={styles.gridItem}>Item 6</div>
      </div>
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  // The CSS challenge is applied to this component
  // Use React hooks to create a responsive grid
  const { useState, useEffect } = React;

  // State to track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update window width when resized
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine number of columns based on window width
  const getColumns = () => {
    if (windowWidth <= 480) {
      return 1; // Mobile: 1 column
    } else if (windowWidth <= 768) {
      return 2; // Tablet: 2 columns
    } else {
      return 3; // Desktop: 3 columns
    }
  };

  // Create grid styles based on column count
  const getGridStyle = () => {
    return {
      display: "grid",
      gridTemplateColumns: getColumns() === 1 ? "1fr" :
                          getColumns() === 2 ? "1fr 1fr" :
                          "1fr 1fr 1fr",
      gap: "1rem",
      padding: "1rem"
    };
  };

  const styles = {
    gridItem: {
      backgroundColor: "#f0f0f0",
      padding: "2rem",
      textAlign: "center",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    info: {
      marginBottom: "1rem",
      fontSize: "0.9rem",
      color: "#666"
    }
  };

  return (
    <div>
      <div style={styles.info}>
        Current window width: {windowWidth}px | Columns: {getColumns()}
        <br />
        <small>Resize your browser window to see the grid change</small>
      </div>
      <div style={getGridStyle()}>
        <div style={styles.gridItem}>Item 1</div>
        <div style={styles.gridItem}>Item 2</div>
        <div style={styles.gridItem}>Item 3</div>
        <div style={styles.gridItem}>Item 4</div>
        <div style={styles.gridItem}>Item 5</div>
        <div style={styles.gridItem}>Item 6</div>
      </div>
    </div>
  );
}`,
    solutionMarker: "if (windowWidth <= 480) {",
    order: 3,
  },
  {
    id: "animations",
    pathId: "css",
    title: "4. CSS Animations",
    description:
      "Create a button that changes color and size when hovered. The transition should be smooth and take 0.3 seconds.",
    initialCode: String.raw`function Component() {
  // Create a button with hover animations
  const { useState } = React;
  const [isHovered, setIsHovered] = useState(false);

  // Modify these styles to create a smooth animation
  const buttonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: isHovered ? "#2563eb" : "#3b82f6", // Changes on hover
    color: "white",
    // Add your animation properties here
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <button
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Hover Me
      </button>
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  // Create a button with hover animations
  const { useState } = React;
  const [isHovered, setIsHovered] = useState(false);

  // Styles with smooth transition
  const buttonStyle = {
    padding: isHovered ? "14px 28px" : "12px 24px",
    fontSize: isHovered ? "18px" : "16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: isHovered ? "#2563eb" : "#3b82f6",
    color: "white",
    boxShadow: isHovered ? "0 4px 8px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    outline: "none"
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <button
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Hover Me
      </button>
    </div>
  );
}`,
    solutionMarker: "transition: \"all 0.3s ease\"",
    order: 4,
  },
  {
    id: "card-design",
    pathId: "css",
    title: "5. Card Design",
    description:
      "Create a product card with an image, title, description, price, and a call-to-action button. The card should have a shadow and rounded corners.",
    initialCode: String.raw`function Component() {
  // Create a product card with styling
  // Modify the style objects below

  const styles = {
    card: {
      /* Your code here */
    },
    image: {
      /* Your code here */
    },
    title: {
      /* Your code here */
    },
    description: {
      /* Your code here */
    },
    price: {
      /* Your code here */
    },
    button: {
      /* Your code here */
    }
  };

  return (
    <div style={styles.card}>
      <img
        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
        alt="Product"
        style={styles.image}
      />
      <h2 style={styles.title}>Running Shoes</h2>
      <p style={styles.description}>Lightweight running shoes with cushioned soles for maximum comfort during your workout.</p>
      <div style={styles.price}>$99.99</div>
      <button style={styles.button}>Add to Cart</button>
    </div>
  );
}`,
    solutionCode: String.raw`function Component() {
  // Create a product card with styling
  const styles = {
    card: {
      maxWidth: "300px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      margin: "0 auto",
      backgroundColor: "white"
    },
    image: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
      borderBottom: "1px solid #e5e7eb"
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: "600",
      margin: "1rem 1rem 0.5rem 1rem",
      color: "#1f2937"
    },
    description: {
      fontSize: "0.875rem",
      margin: "0 1rem 1rem 1rem",
      color: "#6b7280",
      lineHeight: "1.5"
    },
    price: {
      fontSize: "1.5rem",
      fontWeight: "700",
      margin: "0 1rem 1rem 1rem",
      color: "#2563eb"
    },
    button: {
      display: "block",
      width: "calc(100% - 2rem)",
      margin: "0 1rem 1rem 1rem",
      padding: "0.75rem 0",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s"
    }
  };

  // Add hover effect with JavaScript
  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = "#1d4ed8";
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = "#2563eb";
  };

  return (
    <div style={styles.card}>
      <img
        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
        alt="Product"
        style={styles.image}
      />
      <h2 style={styles.title}>Running Shoes</h2>
      <p style={styles.description}>Lightweight running shoes with cushioned soles for maximum comfort during your workout.</p>
      <div style={styles.price}>$99.99</div>
      <button
        style={styles.button}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Add to Cart
      </button>
    </div>
  );
}`,
    solutionMarker: "boxShadow: \"0 4px 6px rgba(0, 0, 0, 0.1)\"",
    order: 5,
  },
];
