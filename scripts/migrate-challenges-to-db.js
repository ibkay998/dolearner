#!/usr/bin/env node

/**
 * Database Migration Script for DoLearner Platform
 * 
 * This script migrates missing challenges from local TypeScript files to the Supabase database.
 * 
 * Current State (verified):
 * - React: ✅ 9/9 challenges in database (fully migrated)
 * - CSS: ❌ 1/5 challenges in database (missing 4)
 * - DSA: ❌ 1/5 challenges in database (missing 4)
 * 
 * Usage: node scripts/migrate-challenges-to-db.js
 */

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Learning Path IDs (verified from database)
const LEARNING_PATHS = {
  react: 'e20c46a1-9b41-4da5-baea-d7f52cb6b058',
  css: 'ee75a3a4-fd16-472a-842b-5d9522eac606',
  dsa: 'f82ff6b4-40dc-499c-9ab8-2fe9f3511905'
};

// Missing challenges data (extracted from local files)
const missingChallenges = {
  css: [
    {
      id: "flexbox-layout",
      pathId: "css",
      title: "2. Flexbox Layout",
      description: "Create a navigation bar using flexbox. The navigation should have a logo on the left and navigation links on the right. The navigation links should be evenly spaced.",
      initialCode: `function Component() {
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
    <nav style={styles.navbar}>
      <div style={styles.logo}>Logo</div>
      <div style={styles.navLinks}>
        <a href="#" style={styles.navLink}>Home</a>
        <a href="#" style={styles.navLink}>About</a>
        <a href="#" style={styles.navLink}>Contact</a>
      </div>
    </nav>
  );
}`,
      solutionCode: `function Component() {
  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#007bff'
    },
    navLinks: {
      display: 'flex',
      gap: '2rem'
    },
    navLink: {
      textDecoration: 'none',
      color: '#333',
      fontWeight: '500',
      transition: 'color 0.2s'
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>Logo</div>
      <div style={styles.navLinks}>
        <a href="#" style={styles.navLink}>Home</a>
        <a href="#" style={styles.navLink}>About</a>
        <a href="#" style={styles.navLink}>Contact</a>
      </div>
    </nav>
  );
}`,
      solutionMarker: "justifyContent: 'space-between'",
      order: 2,
    },
    {
      id: "responsive-grid",
      pathId: "css",
      title: "3. Responsive Grid",
      description: "Create a responsive grid layout with CSS Grid. The grid should have 3 columns on desktop, 2 columns on tablet, and 1 column on mobile. Use the window.innerWidth to detect screen size and adjust the grid accordingly.",
      initialCode: `function Component() {
  // The CSS challenge is applied to this component
  // Use React hooks to create a responsive grid
  const { useState, useEffect } = React;

  // State to track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine grid columns based on window width
  const getGridColumns = () => {
    /* Your code here */
  };

  const styles = {
    container: {
      /* Your code here */
    },
    item: {
      /* Your code here */
    }
  };

  return (
    <div style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map(num => (
        <div key={num} style={styles.item}>
          Item {num}
        </div>
      ))}
    </div>
  );
}`,
      solutionCode: `function Component() {
  const { useState, useEffect } = React;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGridColumns = () => {
    if (windowWidth >= 1024) return 3; // Desktop
    if (windowWidth >= 768) return 2;  // Tablet
    return 1; // Mobile
  };

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: \`repeat(\${getGridColumns()}, 1fr)\`,
      gap: '1rem',
      padding: '1rem'
    },
    item: {
      backgroundColor: '#e9ecef',
      padding: '2rem',
      textAlign: 'center',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }
  };

  return (
    <div style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map(num => (
        <div key={num} style={styles.item}>
          Item {num}
        </div>
      ))}
    </div>
  );
}`,
      solutionMarker: "gridTemplateColumns:",
      order: 3,
    },
    {
      id: "css-animations",
      pathId: "css",
      title: "4. CSS Animations",
      description: "Create a button with hover animations. The button should scale up slightly on hover and have a smooth color transition. Add a loading spinner animation that appears when the button is clicked.",
      initialCode: `function Component() {
  // Create an animated button with hover effects and loading state
  const { useState } = React;
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const styles = {
    button: {
      /* Your code here */
    },
    spinner: {
      /* Your code here */
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <button 
        style={styles.button}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <div style={styles.spinner}></div>
        ) : (
          'Click Me!'
        )}
      </button>
    </div>
  );
}`,
      solutionCode: `function Component() {
  const { useState } = React;
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const styles = {
    button: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '8px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      transform: 'scale(1)',
      opacity: isLoading ? 0.7 : 1,
      minWidth: '120px',
      minHeight: '44px'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto'
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <style>
        {\`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          button:hover:not(:disabled) {
            transform: scale(1.05);
            backgroundColor: #0056b3;
          }
        \`}
      </style>
      <button 
        style={styles.button}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <div style={styles.spinner}></div>
        ) : (
          'Click Me!'
        )}
      </button>
    </div>
  );
}`,
      solutionMarker: "transform: scale(1.05)",
      order: 4,
    },
    {
      id: "card-design",
      pathId: "css",
      title: "5. Card Design",
      description: "Create a product card with an image, title, description, price, and a call-to-action button. The card should have a shadow and rounded corners.",
      initialCode: `function Component() {
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
        src="https://via.placeholder.com/300x200" 
        alt="Product" 
        style={styles.image}
      />
      <h3 style={styles.title}>Premium Headphones</h3>
      <p style={styles.description}>
        High-quality wireless headphones with noise cancellation and premium sound quality.
      </p>
      <div style={styles.price}>$199.99</div>
      <button style={styles.button}>Add to Cart</button>
    </div>
  );
}`,
      solutionCode: `function Component() {
  const styles = {
    card: {
      maxWidth: '300px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    image: {
      width: '100%',
      height: '200px',
      objectFit: 'cover'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      margin: '1rem 1rem 0.5rem',
      color: '#333'
    },
    description: {
      fontSize: '0.9rem',
      color: '#666',
      margin: '0 1rem',
      lineHeight: '1.4'
    },
    price: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#007bff',
      margin: '1rem'
    },
    button: {
      width: 'calc(100% - 2rem)',
      margin: '0 1rem 1rem',
      padding: '0.75rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div style={styles.card}>
      <img 
        src="https://via.placeholder.com/300x200" 
        alt="Product" 
        style={styles.image}
      />
      <h3 style={styles.title}>Premium Headphones</h3>
      <p style={styles.description}>
        High-quality wireless headphones with noise cancellation and premium sound quality.
      </p>
      <div style={styles.price}>$199.99</div>
      <button style={styles.button}>Add to Cart</button>
    </div>
  );
}`,
      solutionMarker: "boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'",
      order: 5,
    }
  ],
  dsa: [
    {
      id: "valid-parentheses",
      pathId: "dsa",
      title: "2. Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.",
      initialCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Your code here
    
}

// Example usage:
// isValid("()") should return true
// isValid("()[]{}" should return true
// isValid("(]") should return false`,
      solutionCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const mapping = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char in mapping) {
            const topElement = stack.length === 0 ? '#' : stack.pop();
            if (mapping[char] !== topElement) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}`,
      solutionMarker: "stack.pop()",
      order: 2,
    },
    {
      id: "merge-sorted-arrays",
      pathId: "dsa",
      title: "3. Merge Sorted Arrays",
      description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order.",
      initialCode: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1, m, nums2, n) {
    // Your code here
    
}

// Example usage:
// nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
// After merge: nums1 = [1,2,2,3,5,6]`,
      solutionCode: `/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
function merge(nums1, m, nums2, n) {
    let i = m - 1;
    let j = n - 1;
    let k = m + n - 1;
    
    while (i >= 0 && j >= 0) {
        if (nums1[i] > nums2[j]) {
            nums1[k] = nums1[i];
            i--;
        } else {
            nums1[k] = nums2[j];
            j--;
        }
        k--;
    }
    
    while (j >= 0) {
        nums1[k] = nums2[j];
        j--;
        k--;
    }
}`,
      solutionMarker: "nums1[k] = nums2[j]",
      order: 3,
    },
    {
      id: "maximum-subarray",
      pathId: "dsa",
      title: "4. Maximum Subarray",
      description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. This is a classic dynamic programming problem known as Kadane's algorithm.",
      initialCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Your code here
    
}

// Example usage:
// maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) should return 6
// The subarray [4,-1,2,1] has the largest sum = 6`,
      solutionCode: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}`,
      solutionMarker: "maxEndingHere + nums[i]",
      order: 4,
    },
    {
      id: "binary-search",
      pathId: "dsa",
      title: "5. Binary Search",
      description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
      initialCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    // Your code here
    
}

// Example usage:
// search([-1,0,3,5,9,12], 9) should return 4
// search([-1,0,3,5,9,12], 2) should return -1`,
      solutionCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`,
      solutionMarker: "left <= right",
      order: 5,
    }
  ]
};

/**
 * Get existing challenges from database
 */
async function getExistingChallenges() {
  console.log('📋 Fetching existing challenges from database...');
  
  const { data, error } = await supabase
    .from('challenges_new')
    .select('legacy_id')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error fetching existing challenges:', error);
    throw error;
  }

  const existingIds = new Set(data?.map(c => c.legacy_id) || []);
  console.log(`✅ Found ${existingIds.size} existing challenges in database`);
  
  return existingIds;
}

/**
 * Convert local challenge to database format
 */
function convertToDbFormat(challenge, pathId) {
  return {
    id: randomUUID(),
    legacy_id: challenge.id,
    path_id: pathId,
    title: challenge.title,
    description: challenge.description,
    instructions: challenge.description, // Use description as instructions
    starter_code: challenge.initialCode,
    solution_code: challenge.solutionCode,
    challenge_type: challenge.pathId === 'dsa' ? 'algorithm' : 'component',
    difficulty: 'beginner', // Default for now
    order_index: challenge.order || 1,
    is_active: true,
    metadata: {
      solution_marker: challenge.solutionMarker
    }
  };
}

/**
 * Migrate challenges for a specific path
 */
async function migrateChallengesForPath(pathName, pathId, challenges, existingIds) {
  console.log(`\n🔄 Processing ${pathName} challenges...`);
  
  const missingChallenges = challenges.filter(c => !existingIds.has(c.id));
  
  if (missingChallenges.length === 0) {
    console.log(`✅ All ${pathName} challenges already in database`);
    return 0;
  }

  console.log(`📝 Found ${missingChallenges.length} missing ${pathName} challenges:`);
  missingChallenges.forEach(c => console.log(`   - ${c.id}: ${c.title}`));

  // Convert to database format
  const dbChallenges = missingChallenges.map(c => convertToDbFormat(c, pathId));

  // Insert into database
  const { data, error } = await supabase
    .from('challenges_new')
    .insert(dbChallenges)
    .select('legacy_id, title');

  if (error) {
    console.error(`❌ Error inserting ${pathName} challenges:`, error);
    throw error;
  }

  console.log(`✅ Successfully migrated ${data?.length || 0} ${pathName} challenges`);
  return data?.length || 0;
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting DoLearner Challenge Migration');
  console.log('=' .repeat(50));

  try {
    // Get existing challenges
    const existingIds = await getExistingChallenges();

    let totalMigrated = 0;

    // Migrate CSS challenges
    totalMigrated += await migrateChallengesForPath(
      'CSS',
      LEARNING_PATHS.css,
      missingChallenges.css,
      existingIds
    );

    // Migrate DSA challenges
    totalMigrated += await migrateChallengesForPath(
      'DSA',
      LEARNING_PATHS.dsa,
      missingChallenges.dsa,
      existingIds
    );

    console.log(`\n🎉 Migration completed! Total challenges migrated: ${totalMigrated}`);

    if (totalMigrated > 0) {
      console.log('\n✅ Next steps:');
      console.log('   1. Run audit script to verify: pnpm run audit-challenges');
      console.log('   2. Update components to use database fetching');
      console.log('   3. Test all challenge paths');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
