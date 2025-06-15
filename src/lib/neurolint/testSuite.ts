export interface TestCase {
  name: string;
  description: string;
  input: string;
  expectedFixes: string[];
  category: "config" | "pattern" | "component" | "hydration";
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  transformedCode: string;
  detectedFixes: string[];
  missingFixes: string[];
  executionTime: number;
}

// Minimal test suite for Layer 1 config optimization
export const TEST_CASES: TestCase[] = [
  {
    name: "TypeScript Compiler Target Upgrade",
    description: "Ensures tsconfig.json target is set to ES2022.",
    category: "config",
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
