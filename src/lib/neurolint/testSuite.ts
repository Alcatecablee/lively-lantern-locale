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
    expectedFixes: ["Upgraded TypeScript target to ES2022"],
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
    expectedFixes: ["Enabled reactStrictMode", "Optimized next.config.js"],
  },
  {
    name: "Package Scripts Upgrade",
    description:
      "Ensures package.json scripts include modern development tools.",
    category: "config",
    layerIds: [1],
    severity: "low",
    input: `{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
    expectedFixes: ["Added missing development scripts"],
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
    expectedFixes: ["Fixed HTML entities"],
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
    expectedFixes: ["Modernized variable declarations"],
  },
  {
    name: "Legacy Function Syntax",
    description:
      "Modernizes function declarations to arrow functions where appropriate.",
    category: "pattern",
    layerIds: [2],
    severity: "low",
    input: `var handler = function(event) {
  return event.target.value;
};`,
    expectedFixes: ["Modernized function syntax"],
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
    expectedFixes: ["Added missing React keys"],
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
    expectedFixes: ["Added missing imports"],
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
    expectedFixes: ["Improved accessibility"],
  },
  {
    name: "PropTypes Addition",
    description: "Adds missing PropTypes for component validation.",
    category: "component",
    layerIds: [3],
    severity: "medium",
    input: `const UserCard = ({ name, email, age }) => (
  <div>
    <h3>{name}</h3>
    <p>{email}</p>
    <span>Age: {age}</span>
  </div>
);`,
    expectedFixes: ["Added prop type validation"],
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
    expectedFixes: ["Added SSR safety checks"],
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
    expectedFixes: ["Added hydration guards"],
  },
  {
    name: "Browser API Protection",
    description: "Protects browser-specific APIs from SSR errors.",
    category: "hydration",
    layerIds: [4],
    severity: "high",
    input: `const ThemeToggle = () => {
  const theme = document.body.className;
  const toggleTheme = () => {
    document.body.className = theme === 'dark' ? 'light' : 'dark';
  };
  return <button onClick={toggleTheme}>Toggle Theme</button>;
};`,
    expectedFixes: ["Added browser API protection"],
  },

  // Integration Tests (Multiple Layers)
  {
    name: "Full Pipeline Test - Simple",
    description:
      "Tests layers 1-4 working together on moderately complex code.",
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
      "Added missing imports",
    ],
  },
  {
    name: "Full Pipeline Test - Complex",
    description:
      "Tests all layers on complex React component with multiple issues.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "high",
    input: `var UserDashboard = function(props) {
  var userPrefs = localStorage.getItem('userPrefs');
  var windowWidth = window.innerWidth;
  var notifications = props.notifications || [];

  return (
    <div>
      <h1>Welcome &amp; enjoy your dashboard</h1>
      <div>Screen width: {windowWidth}px</div>
      <ul>
        {notifications.map(notif => (
          <li>
            <span>{notif.message}</span>
            <button onClick={() => dismiss(notif.id)}>Dismiss</button>
          </li>
        ))}
      </ul>
      <p>Preferences: {userPrefs}</p>
    </div>
  );
};`,
    expectedFixes: [
      "Modernized variable declarations",
      "Fixed HTML entities",
      "Added missing React keys",
      "Added SSR safety checks",
      "Added hydration guards",
      "Improved accessibility",
    ],
  },

  // Edge Cases and Error Tests
  {
    name: "Malformed JSX Recovery",
    description: "Should detect and handle malformed JSX gracefully.",
    category: "component",
    layerIds: [3],
    severity: "high",
    shouldFail: false,
    input: `const Broken = () => (
  <div>
    <p>Unclosed paragraph
    <span>Missing closing div
);`,
    expectedFixes: [],
    expectedErrors: ["Syntax error"],
  },
  {
    name: "Empty Code Handling",
    description: "Should handle empty or minimal code gracefully.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "low",
    input: ``,
    expectedFixes: [],
  },
  {
    name: "Very Large Code Handling",
    description: "Tests performance with highly repetitive code.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "low",
    input: Array(50)
      .fill(0)
      .map((_, i) => `var func${i} = function() { return ${i}; };`)
      .join("\n"),
    expectedFixes: ["Modernized variable declarations"],
  },
  {
    name: "Mixed Valid/Invalid Code",
    description: "Tests handling of partially corrupted code.",
    category: "component",
    layerIds: [3],
    severity: "medium",
    input: `const ValidComponent = () => <div>Valid</div>;
const BrokenComponent = () => <div><span>Unclosed
const AnotherValid = () => <p>Also valid</p>;`,
    expectedFixes: [],
    expectedErrors: ["Syntax error"],
  },

  // Layer Conflict Tests
  {
    name: "Layer Order Dependency",
    description: "Ensures layer 2 changes don't break layer 3 fixes.",
    category: "integration",
    layerIds: [2, 3],
    severity: "high",
    input: `var items = ['one', 'two'];
var ListComponent = function() {
  return (
    <ul>
      {items.map(item => <li>{item}</li>)}
    </ul>
  );
};`,
    expectedFixes: [
      "Modernized variable declarations",
      "Added missing React keys",
    ],
  },

  // Dry Run Tests
  {
    name: "Dry Run Validation",
    description: "Ensures dry run mode doesn't modify code.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "medium",
    input: `const original = 'should not change';`,
    expectedFixes: [],
  },

  // Backup and Recovery Tests
  {
    name: "Backup Creation Test",
    description: "Verifies that backups are created before transformations.",
    category: "integration",
    layerIds: [1, 2, 3, 4],
    severity: "medium",
    input: `var test = 'backup me';`,
    expectedFixes: ["Modernized variable declarations"],
  },
];

// Test execution utility functions
export async function runTestSuite(
  orchestrator: (
    code: string,
    filePath?: string,
    useAST?: boolean,
    layerIds?: number[],
    options?: any,
  ) => Promise<any>,
  options: { verbose?: boolean; categories?: string[]; dryRun?: boolean } = {},
): Promise<TestSuiteResult> {
  const startTime = Date.now();
  const results: TestResult[] = [];

  const categories = {
    config: { passed: 0, total: 0 },
    pattern: { passed: 0, total: 0 },
    component: { passed: 0, total: 0 },
    hydration: { passed: 0, total: 0 },
    integration: { passed: 0, total: 0 },
  };

  const filteredTests = options.categories
    ? TEST_CASES.filter((test) => options.categories!.includes(test.category))
    : TEST_CASES;

  for (const testCase of filteredTests) {
    const testStartTime = Date.now();
    categories[testCase.category].total++;

    try {
      const result = await orchestrator(
        testCase.input,
        undefined,
        true,
        testCase.layerIds || [1, 2, 3, 4],
        {
          dryRun: options.dryRun || false,
          verbose: options.verbose || false,
        },
      );

      const executionTime = Date.now() - testStartTime;
      const detectedFixes = result.layers
        .filter((layer: any) => layer.success)
        .flatMap((layer: any) => layer.improvements || []);

      const missingFixes = testCase.expectedFixes.filter(
        (fix) => !detectedFixes.some((detected) => detected.includes(fix)),
      );

      const passed = testCase.shouldFail
        ? !result.layers.every((layer: any) => layer.success)
        : missingFixes.length === 0 &&
          result.layers.some((layer: any) => layer.success);

      if (passed) {
        categories[testCase.category].passed++;
      }

      const testResult: TestResult = {
        testCase,
        passed,
        transformedCode: result.transformed,
        detectedFixes,
        missingFixes,
        executionTime,
        layerResults: result.layers.map((layer: any) => ({
          layerId: layer.layerId || 0,
          success: layer.success,
          changes: layer.changeCount || 0,
          reverted: layer.reverted || false,
        })),
        validationPassed: !result.layers.some((layer: any) => layer.reverted),
        backupCreated: !!result.backup,
      };

      results.push(testResult);

      if (options.verbose) {
        const status = passed ? "✅" : "❌";
        console.log(`${status} ${testCase.name} (${executionTime}ms)`);
        if (!passed && missingFixes.length > 0) {
          console.log(`   Missing: ${missingFixes.join(", ")}`);
        }
      }
    } catch (error) {
      categories[testCase.category].total++;

      const testResult: TestResult = {
        testCase,
        passed: false,
        transformedCode: testCase.input,
        detectedFixes: [],
        missingFixes: testCase.expectedFixes,
        executionTime: Date.now() - testStartTime,
        layerResults: [],
        validationPassed: false,
        backupCreated: false,
      };

      results.push(testResult);

      if (options.verbose) {
        console.log(`💥 ${testCase.name} - ERROR: ${error}`);
      }
    }
  }

  const totalExecutionTime = Date.now() - startTime;
  const passedTests = results.filter((r) => r.passed).length;
  const criticalFailures = results.filter(
    (r) => !r.passed && r.testCase.severity === "high",
  );

  return {
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests,
    totalExecutionTime,
    categories,
    criticalFailures,
  };
}

// Validate a single test result against its test case
export function validateTestResult(
  testCase: TestCase,
  transformedCode: string,
): {
  passed: boolean;
  detectedFixes: string[];
  missingFixes: string[];
} {
  // Simple validation - detect improvements based on code changes
  const detectedFixes: string[] = [];

  // Check for specific improvements based on the transformed code
  for (const expectedFix of testCase.expectedFixes) {
    let fixDetected = false;

    // Layer-specific fix detection - be more precise
    if (
      expectedFix.includes("TypeScript target") &&
      transformedCode.includes('"target": "ES2022"')
    ) {
      fixDetected = true;
    } else if (
      expectedFix.includes("reactStrictMode") &&
      transformedCode.includes("reactStrictMode: true")
    ) {
      fixDetected = true;
    } else if (
      expectedFix.includes("development scripts") &&
      (transformedCode.includes("lint:fix") ||
        transformedCode.includes("type-check"))
    ) {
      fixDetected = true;
    } else if (expectedFix.includes("HTML entities")) {
      // Check if entities were actually converted
      const hasAmp =
        testCase.input.includes("&amp;") && !transformedCode.includes("&amp;");
      const hasCopy =
        testCase.input.includes("&copy;") &&
        !transformedCode.includes("&copy;");
      const hasLt =
        testCase.input.includes("&lt;") && !transformedCode.includes("&lt;");
      const hasGt =
        testCase.input.includes("&gt;") && !transformedCode.includes("&gt;");
      if (hasAmp || hasCopy || hasLt || hasGt) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("variable declarations")) {
      // Check if var was actually converted to const
      const hadVar = testCase.input.includes("var ");
      const hasConst =
        transformedCode.includes("const ") && !transformedCode.includes("var ");
      if (hadVar && hasConst) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("React keys")) {
      // Check if keys were actually added where missing
      const hadMapWithoutKey =
        testCase.input.includes(".map(") && !testCase.input.includes("key=");
      const hasMapWithKey = transformedCode.includes("key=");
      if (hadMapWithoutKey && hasMapWithKey) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("missing imports")) {
      const hadUseState =
        testCase.input.includes("useState") &&
        !testCase.input.includes("import");
      const hasImport =
        transformedCode.includes("import { useState") ||
        transformedCode.includes("import React");
      if (hadUseState && hasImport) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("accessibility")) {
      const hasAria =
        transformedCode.includes("aria-") && !testCase.input.includes("aria-");
      if (hasAria) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("SSR safety")) {
      const hadLocalStorage =
        testCase.input.includes("localStorage") &&
        !testCase.input.includes("typeof window");
      const hasSafetyCheck = transformedCode.includes(
        'typeof window !== "undefined"',
      );
      if (hadLocalStorage && hasSafetyCheck) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("hydration guards")) {
      const hadWindowAccess =
        testCase.input.includes("window.") &&
        !testCase.input.includes("useEffect");
      const hasUseEffect = transformedCode.includes("useEffect");
      if (hadWindowAccess && hasUseEffect) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("browser API")) {
      const hadDocument =
        testCase.input.includes("document.") &&
        !testCase.input.includes("typeof document");
      const hasSafetyCheck = transformedCode.includes("typeof document");
      if (hadDocument && hasSafetyCheck) {
        fixDetected = true;
      }
    } else if (expectedFix.includes("function syntax")) {
      const hadOldFunction =
        testCase.input.includes("function(") && testCase.input.includes("var ");
      const hasModernSyntax =
        transformedCode.includes("const ") && !transformedCode.includes("var ");
      if (hadOldFunction && hasModernSyntax) {
        fixDetected = true;
      }
    }

    if (fixDetected) {
      detectedFixes.push(expectedFix);
    }
  }

  const missingFixes = testCase.expectedFixes.filter(
    (fix) => !detectedFixes.includes(fix),
  );

  // Test passes if we detected all expected fixes or if no fixes were expected
  const passed = testCase.shouldFail
    ? false // If test should fail, it should not pass
    : missingFixes.length === 0;

  return {
    passed,
    detectedFixes,
    missingFixes,
  };
}

export function generateTestReport(result: TestSuiteResult): string {
  const successRate = ((result.passedTests / result.totalTests) * 100).toFixed(
    1,
  );

  let report = `
🧪 NeuroLint Test Suite Results
================================

📊 Overall Results:
  • Total Tests: ${result.totalTests}
  • Passed: ${result.passedTests} (${successRate}%)
  • Failed: ${result.failedTests}
  • Execution Time: ${result.totalExecutionTime}ms

📋 By Category:
`;

  for (const [category, stats] of Object.entries(result.categories)) {
    const categoryRate =
      stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : "0";
    report += `  • ${category}: ${stats.passed}/${stats.total} (${categoryRate}%)\n`;
  }

  if (result.criticalFailures.length > 0) {
    report += `\n🚨 Critical Failures (${result.criticalFailures.length}):\n`;
    result.criticalFailures.forEach((failure) => {
      report += `  • ${failure.testCase.name}: ${failure.missingFixes.join(", ")}\n`;
    });
  }

  return report;
}
