export interface TestCase {
  name: string;
  description: string;
  input: string;
  expectedFixes: string[];
  category: 'basic' | 'entities' | 'hydration' | 'accessibility' | 'duplicates' | 'nextjs';
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  transformedCode: string;
  detectedFixes: string[];
  missingFixes: string[];
  executionTime: number;
  error?: string;
  layers?: any[];
  conflicts?: any;
  changeAnalysis?: any;
  semanticAnalysis?: any;
  validationReport?: any;
}

export const TEST_CASES: TestCase[] = [
  {
    name: "Basic React Component Issues",
    description: "Tests var to const conversion, missing keys, console.log optimization, missing 'use client'",
    category: 'basic',
    input: `function MyComponent() {
  const [data, setData] = useState([]);
  var isLoading = true;
  console.log("Component rendered");
  
  return (
    <div>
      {data.map(item => (
        <div>{item.name}</div>
      ))}
      <button onClick={() => alert("clicked")}>Click me</button>
    </div>
  );
}`,
    expectedFixes: [
      'Added use client directive',
      'Added missing key props',
      'Optimized console statements',
      'Added missing imports',
      'Converted var to const'
    ]
  },
  
  {
    name: "HTML Entity Corruption",
    description: "Tests HTML entity decoding and import cleanup",
    category: 'entities',
    input: `import React from &quot;react&quot;;
import { useState, useEffect } from &#x27;react&#x27;;

function EntityTest() {
  const message = &quot;Hello &amp; welcome!&quot;;
  return <div>{message}</div>;
}`,
    expectedFixes: [
      'Fixed HTML entity corruption',
      'Added use client directive'
    ]
  },
  
  {
    name: "Hydration and SSR Issues",
    description: "Tests localStorage SSR guards and hydration fixes",
    category: 'hydration',
    input: `function ThemeComponent() {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setTheme(saved || 'light');
  }, []);
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
      }}>
        Toggle Theme
      </button>
    </div>
  );
}`,
    expectedFixes: [
      'Added SSR guards',
      'Added use client directive'
    ]
  },
  
  {
    name: "Missing Props and Accessibility",
    description: "Tests prop interfaces, accessibility attributes, and key props",
    category: 'accessibility',
    input: `function UserCard({ user }) {
  return (
    <div>
      <img src={user.avatar} />
      <button>Delete User</button>
      {user.posts.map(post => (
        <div>{post.title}</div>
      ))}
    </div>
  );
}`,
    expectedFixes: [
      'Added accessibility attributes',
      'Added missing key props',
      'Added TypeScript interfaces',
      'Added use client directive'
    ]
  },
  
  {
    name: "Duplicate Functions",
    description: "Tests duplicate function removal",
    category: 'duplicates',
    input: `function Calculator() {
  const [result, setResult] = useState(0);
  
  function add(a, b) {
    return a + b;
  }
  
  function add(a, b) {
    return a + b;
  }
  
  return <div>{result}</div>;
}`,
    expectedFixes: [
      'Added use client directive',
      'Added missing imports',
      'Optimized console statements'
    ]
  }
];

export function validateTestResult(testCase: TestCase, transformedCode: string): {
  passed: boolean;
  detectedFixes: string[];
  missingFixes: string[];
} {
  const detectedFixes: string[] = [];
  const missingFixes: string[] = [];

  // More robust checks for specific fixes
  const checks = {
    'Added use client directive': transformedCode.includes("'use client'"),
    'Fixed HTML entity corruption': !transformedCode.includes('&quot;') && !transformedCode.includes('&#x27;') && !transformedCode.includes('&amp;'),
    'Added missing key props': /key=\{[^}]+\}/.test(transformedCode) || transformedCode.includes('key={'),
    'Optimized console statements': transformedCode.includes('console.debug') && !transformedCode.includes('console.log'),
    'Added SSR guards': transformedCode.includes('typeof window !== "undefined"'),
    'Added accessibility attributes': transformedCode.includes('aria-label') || transformedCode.includes('alt=""'),
    'Added TypeScript interfaces': transformedCode.includes('interface') && transformedCode.includes('Props'),
    'Added missing imports': transformedCode.includes('import {') && (transformedCode.includes('useState') || transformedCode.includes('useEffect')),
    'Converted var to const': !transformedCode.includes('var ') && transformedCode.includes('const ')
  };

  testCase.expectedFixes.forEach(expectedFix => {
    if (checks[expectedFix as keyof typeof checks]) {
      detectedFixes.push(expectedFix);
    } else {
      missingFixes.push(expectedFix);
    }
  });

  const passed = missingFixes.length === 0;
  
  return { passed, detectedFixes, missingFixes };
}
