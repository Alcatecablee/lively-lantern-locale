
export interface TestCase {
  name: string;
  description: string;
  input: string;
  expectedFixes: string[];
  category: 'config';
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
  }
];

export function validateTestResult(testCase: TestCase, transformedCode: string): {
  passed: boolean;
  detectedFixes: string[];
  missingFixes: string[];
} {
  const detectedFixes: string[] = [];
  const missingFixes: string[] = [];

  // Checks for config optimizations only
  const checks: Record<string, boolean> = {
    // For tsconfig.json
    "Upgraded TypeScript target to ES2022":
      transformedCode.includes('"target": "ES2022"') ||
      transformedCode.includes('"target":"ES2022"'),

    // For next.config.js
    "Enabled reactStrictMode":
      transformedCode.includes('reactStrictMode: true') ||
      transformedCode.includes('reactStrictMode:true'),
    "Optimized next.config.js":
      !transformedCode.includes('experimental: {}') && transformedCode.includes('module.exports'),

    // For package.json
    "Added lint:fix script":
      transformedCode.includes('"lint:fix":') || transformedCode.includes("'lint:fix':"),
    "Added type-check script":
      transformedCode.includes('"type-check":') || transformedCode.includes("'type-check':"),
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
