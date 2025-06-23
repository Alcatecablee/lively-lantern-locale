export interface TestCase {
  name: string;
  description: string;
  input: string;
  expectedFixes: string[];
  category: "config" | "pattern" | "component" | "hydration" | "integration";
  layerIds?: number[];
  severity: "low" | "medium" | "high";
  shouldFail?: boolean;
  expectedErrors?: string[];
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  transformedCode: string;
  detectedFixes: string[];
  missingFixes: string[];
  executionTime: number;
  layerResults: Array<{
    layerId: number;
    success: boolean;
    changes: number;
    reverted: boolean;
  }>;
  validationPassed: boolean;
  backupCreated: boolean;
}

export interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalExecutionTime: number;
  categories: {
    config: { passed: number; total: number };
    pattern: { passed: number; total: number };
    component: { passed: number; total: number };
    hydration: { passed: number; total: number };
    integration: { passed: number; total: number };
  };
  criticalFailures: TestResult[];
}

// Comprehensive test suite covering all layers and edge cases
export const TEST_CASES: TestCase[] = [
  // Layer 1: Config Tests
  {
    name: "TypeScript Compiler Target Upgrade",
    description: "Ensures tsconfig.json target is set to ES2022.",
    category: "config",
    layerIds: [1],
    severity: "medium",
    input: `{
  "compilerOptions": {
    "target": "es5",
    "strict": true
  }
}`,
    expectedFixes: [
      "Upgraded TypeScript target to ES2022"
    ]
  },
  {
    name: "Modern Next.js Config Export",
    description: "Ensures next.config.js uses modern module.exports pattern.",
    category: "config",
    layerIds: [1],
    severity: "medium",
    input: `module.exports = {
  reactStrictMode: false,
  experimental: {}
};`,
    expectedFixes: [
      "Enabled reactStrictMode",
      "Optimized next.config.js"
    ]
  },
  {
    name: "Package Scripts Upgrade",
    description: "Ensures package.json scripts include 'lint:fix' and 'type-check'.",
    category: "config",
    layerIds: [1],
    severity: "low",
    input: `{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
    expectedFixes: [
      "Added missing development scripts"
    ]
  },

  // Layer 2: Pattern Tests
  {
    name: "HTML Entity Cleanup",
    description: "Fixes HTML entities in JSX code.",
    category: "pattern",
    layerIds: [2],
    severity: "low",
    input: `const Component = () => (
  <div>
    <p>Hello &amp; goodbye</p>
    <span>Copyright &copy; 2024</span>
  </div>
);`,
    expectedFixes: [
      "Fixed HTML entities"
    ]
  },
  {
    name: "Variable Declaration Modernization",
    description: "Converts var declarations to const/let.",
    category: "pattern",
    layerIds: [2],
    severity: "medium",
    input: `var name = "John";
var age = 30;
function example() {
  var result = name + age;
  return result;
}`,
    expectedFixes: [
      "Modernized variable declarations"
    ]
  },

  // Layer 3: Component Tests
  {
    name: "Missing React Keys",
    description: "Adds keys to React list items.",
    category: "component",
    layerIds: [3],
    severity: "high",
    input: `const List = ({ items }) => (
  <ul>
    {items.map(item => (
      <li>{item.name}</li>
    ))}
  </ul>
);`,
    expectedFixes: [
      "Added missing React keys"
    ]
  },
  {
    name: "Missing Imports",
    description: "Adds missing React imports.",
    category: "component",
    layerIds: [3],
    severity: "high",
    input: `const Component = () => {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
};`,
    expectedFixes: [
      "Added missing imports"
    ]
  },
  {
    name: "Accessibility Improvements",
    description: "Adds ARIA attributes for accessibility.",
    category: "component",
    layerIds: [3],
    severity: "medium",
    input: `const Button = ({ onClick }) => (
  <button onClick={onClick}>
    Click me
  </button>
);`,
    expectedFixes: [
      "Improved accessibility"
    ]
  },

  // Layer 4: Hydration Tests
  {
    name: "SSR Safety Guards",
    description: "Adds guards for server-side rendering safety.",
    category: "hydration",
    layerIds: [4],
    severity: "high",
    input: `const Component = () => {
  const data = localStorage.getItem('userData');
  return <div>{data}</div>;
};`,
    expectedFixes: [
      "Added SSR safety checks"
    ]
  },
  {
    name: "Hydration useEffect Guards",
    description: "Protects client-only code with useEffect.",
    category: "hydration",
    layerIds: [4],
    severity: "high",
    input: `const Component = () => {
  const width = window.innerWidth;
  return <div>Width: {width}</div>;
};`,
    expectedFixes: [
      "Added hydration guards"
    ]
  },

  // Integration Tests (Multiple Layers)
  {
    name: "Full Pipeline Test",
    description: "Tests all layers working together on complex code.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "high",
    input: `var Component = function() {
  var data = localStorage.getItem('test');
  var items = ['a', 'b', 'c'];

  return (
    <div>
      <h1>Hello &amp; welcome</h1>
      <ul>
        {items.map(item => <li>{item}</li>)}
      </ul>
      <p>{data}</p>
    </div>
  );
};`,
    expectedFixes: [
      "Modernized variable declarations",
      "Fixed HTML entities",
      "Added missing React keys",
      "Added SSR safety checks",
      "Added missing imports"
    ]
  },

  // Edge Cases and Error Tests
  {
    name: "Malformed JSX Recovery",
    description: "Should detect and handle malformed JSX gracefully.",
    category: "component",
    layerIds: [3],
    severity: "high",
    shouldFail: false, // Should handle gracefully, not crash
    input: `const Broken = () => (
  <div>
    <p>Unclosed paragraph
    <span>Missing closing div
);`,
    expectedFixes: [],
    expectedErrors: ["Syntax error"]
  },
  {
    name: "Circular Dependency Detection",
    description: "Should detect potential circular dependencies.",
    category: "component",
    layerIds: [3],
    severity: "medium",
    input: `import { ComponentB } from './ComponentB';
const ComponentA = () => <ComponentB />;
export default ComponentA;`,
    expectedFixes: []
  },
  {
    name: "Extreme Complexity Test",
    description: "Tests performance with highly complex code.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "low",
    input: Array(100).fill(0).map((_, i) =>
      `var func${i} = function() { return ${i}; };`
    ).join('\n'),
    expectedFixes: [
      "Modernized variable declarations"
    ]
  },

  // Dry Run Tests
  {
    name: "Dry Run Validation",
    description: "Ensures dry run mode doesn't modify code.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "medium",
    input: `const test = 'original';`,
    expectedFixes: []
  }
    category: "config",
    input: `{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
`,
    expectedFixes: [
      "Added lint:fix script",
      "Added type-check script"
    ]
  },
  // --- Layer 2 specific test ---
  {
    name: "HTML Entity Correction",
    description: "Replaces corrupted entities such as &quot; and &amp; in code.",
    category: "pattern",
    input: `
const title = &quot;Welcome &amp; Enjoy!&quot;;
// Hello &gt; Goodbye
`,
    expectedFixes: [
      "Fixed HTML entities in source"
    ]
  },
  // --- Layer 3 specific test ---
  {
    name: "Missing Key Prop Correction",
    description: "Adds missing key prop to mapped elements in React components.",
    category: "component",
    input: `
function List({ items }) {
  return <ul>{items.map(item => <li>{item.name}</li>)}</ul>;
}
`,
    expectedFixes: [
      "Added missing key prop in mapped elements"
    ]
  },
  // --- Layer 4 specific test ---
  {
    name: "Add SSR Guard for LocalStorage Use",
    description: "Protects localStorage access with SSR guard (typeof window check).",
    category: "hydration",
    input: `
const value = localStorage.getItem("something");
`,
    expectedFixes: [
      "Added SSR guard for localStorage"
    ]
  }
];

// --- Update validateTestResult --
export function validateTestResult(testCase: TestCase, transformedCode: string): {
  passed: boolean;
  detectedFixes: string[];
  missingFixes: string[];
} {
  const detectedFixes: string[] = [];
  const missingFixes: string[] = [];

  // Checks for config optimizations only
  const checks: Record<string, boolean> = {
    // --- Layer 1 (config) ---
    "Upgraded TypeScript target to ES2022":
      transformedCode.includes('"target": "ES2022"') ||
      transformedCode.includes('"target":"ES2022"'),

    "Enabled reactStrictMode":
      transformedCode.includes('reactStrictMode: true') ||
      transformedCode.includes('reactStrictMode:true'),
    "Optimized next.config.js":
      !transformedCode.includes('experimental: {}') && transformedCode.includes('module.exports'),

    "Added lint:fix script":
      transformedCode.includes('"lint:fix":') || transformedCode.includes("'lint:fix':"),
    "Added type-check script":
      transformedCode.includes('"type-check":') || transformedCode.includes("'type-check':"),

    // --- Layer 2: Pattern/entity fixes ---
    "Fixed HTML entities in source":
      transformedCode.includes('const title = "Welcome & Enjoy!";') &&
      transformedCode.includes("// Hello > Goodbye"),

    // --- Layer 3: Missing key prop ---
    "Added missing key prop in mapped elements":
      /<li key=/.test(transformedCode),

    // --- Layer 4: SSR guard for localStorage ---
    "Added SSR guard for localStorage":
      transformedCode.includes('typeof window !== "undefined" && localStorage.getItem("something")'),
  };

  testCase.expectedFixes.forEach(expectedFix => {
    if (checks[expectedFix]) {
      detectedFixes.push(expectedFix);
    } else {
      missingFixes.push(expectedFix);
    }
  });

  const passed = missingFixes.length === 0;

  return { passed, detectedFixes, missingFixes };
}