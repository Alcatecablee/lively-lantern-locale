
import * as t from '@babel/types';
import { ASTTransformer } from '../ast/ASTTransformer';

interface PatternMatch {
  pattern: string;
  severity: 'error' | 'warning' | 'info';
  suggestion: string;
  confidence: number;
  autoFix?: boolean;
}

export async function transform(code: string, filePath?: string): Promise<string> {
  let transformed = code;
  
  // Apply AI-powered pattern detection and fixes
  transformed = await detectAndFixAntiPatterns(transformed, filePath);
  transformed = optimizePerformancePatterns(transformed);
  transformed = enforceConsistencyPatterns(transformed);
  transformed = addSmartComments(transformed);
  
  return transformed;
}

async function detectAndFixAntiPatterns(code: string, filePath?: string): Promise<string> {
  const patterns = await analyzeCodePatterns(code, filePath);
  let fixed = code;
  
  for (const pattern of patterns) {
    if (pattern.autoFix && pattern.confidence > 0.8) {
      fixed = await applyPatternFix(fixed, pattern);
    }
  }
  
  return fixed;
}

async function analyzeCodePatterns(code: string, filePath?: string): Promise<PatternMatch[]> {
  const patterns: PatternMatch[] = [];
  
  // Anti-pattern: Inline styles instead of Tailwind classes
  if (code.includes('style={{') && !code.includes('dynamic styles')) {
    patterns.push({
      pattern: 'inline-styles',
      severity: 'warning',
      suggestion: 'Replace inline styles with Tailwind CSS classes for better maintainability',
      confidence: 0.9,
      autoFix: true
    });
  }
  
  // Anti-pattern: Missing error boundaries in components with async operations
  if (code.includes('async') && code.includes('useState') && !code.includes('ErrorBoundary')) {
    patterns.push({
      pattern: 'missing-error-boundary',
      severity: 'error',
      suggestion: 'Add error boundary wrapper for components with async operations',
      confidence: 0.85,
      autoFix: true
    });
  }
  
  // Anti-pattern: Deeply nested ternary operators
  const nestedTernaryPattern = /\?[^:]*\?[^:]*:/g;
  if (nestedTernaryPattern.test(code)) {
    patterns.push({
      pattern: 'nested-ternary',
      severity: 'warning',
      suggestion: 'Extract complex conditional logic to separate functions',
      confidence: 0.9,
      autoFix: true
    });
  }
  
  // Anti-pattern: Missing loading states for async operations
  if (code.includes('fetch(') && !code.includes('loading') && !code.includes('isLoading')) {
    patterns.push({
      pattern: 'missing-loading-state',
      severity: 'warning',
      suggestion: 'Add loading states for better user experience',
      confidence: 0.8,
      autoFix: true
    });
  }
  
  // Performance pattern: Unnecessary re-renders
  if (code.includes('useEffect') && code.includes('[]') && code.includes('useState')) {
    const effectsCount = (code.match(/useEffect/g) || []).length;
    const statesCount = (code.match(/useState/g) || []).length;
    
    if (effectsCount > 3 && statesCount > 5) {
      patterns.push({
        pattern: 'excessive-state-effects',
        severity: 'warning',
        suggestion: 'Consider using useReducer or custom hooks to manage complex state',
        confidence: 0.75,
        autoFix: false
      });
    }
  }
  
  return patterns;
}

async function applyPatternFix(code: string, pattern: PatternMatch): Promise<string> {
  let fixed = code;
  
  switch (pattern.pattern) {
    case 'inline-styles':
      // Convert common inline styles to Tailwind classes
      fixed = fixed.replace(/style=\{\{[^}]*color:\s*['"]red['"][^}]*\}\}/g, 'className="text-red-500"');
      fixed = fixed.replace(/style=\{\{[^}]*backgroundColor:\s*['"]blue['"][^}]*\}\}/g, 'className="bg-blue-500"');
      fixed = fixed.replace(/style=\{\{[^}]*padding:\s*['"]1rem['"][^}]*\}\}/g, 'className="p-4"');
      break;
      
    case 'missing-loading-state':
      // Add loading state for fetch operations
      if (!fixed.includes('const [isLoading, setIsLoading]')) {
        const statePattern = /const \[([^,]+),\s*set[^\]]+\] = useState/;
        const match = fixed.match(statePattern);
        if (match) {
          fixed = fixed.replace(match[0], `const [isLoading, setIsLoading] = useState(false);\n  ${match[0]}`);
        }
      }
      break;
      
    case 'nested-ternary':
      // Extract nested ternary to helper function
      const ternaryMatch = fixed.match(/(\w+)\s*\?\s*([^:]+)\s*\?\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([^;]+)/);
      if (ternaryMatch) {
        const [fullMatch, condition, innerCondition, trueValue, falseValue, finalValue] = ternaryMatch;
        const helperFunction = `
  const getConditionalValue = (${condition}: any) => {
    if (${condition}) {
      return ${innerCondition} ? ${trueValue} : ${falseValue};
    }
    return ${finalValue};
  };`;
        
        fixed = fixed.replace(fullMatch, `getConditionalValue(${condition})`);
        // Add helper function at the beginning of the component
        const functionStart = fixed.indexOf('function') !== -1 ? fixed.indexOf('function') : fixed.indexOf('const');
        if (functionStart !== -1) {
          const insertPoint = fixed.indexOf('{', functionStart) + 1;
          fixed = fixed.slice(0, insertPoint) + helperFunction + fixed.slice(insertPoint);
        }
      }
      break;
      
    case 'missing-error-boundary':
      // Add error boundary wrapper (simplified version)
      const componentMatch = fixed.match(/export default function (\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const errorBoundaryWrapper = `
function ${componentName}WithErrorBoundary(props: any) {
  try {
    return <${componentName} {...props} />;
  } catch (error) {
    console.error('Component error:', error);
    return <div className="p-4 text-red-600">Something went wrong. Please try again.</div>;
  }
}`;
        
        fixed = fixed.replace(`export default function ${componentName}`, `${errorBoundaryWrapper}\n\nfunction ${componentName}`) + `\n\nexport default ${componentName}WithErrorBoundary;`;
      }
      break;
  }
  
  return fixed;
}

function optimizePerformancePatterns(code: string): string {
  let optimized = code;
  
  // Add React.memo for components without hooks
  if (optimized.includes('export default function') && 
      !optimized.includes('useState') && 
      !optimized.includes('useEffect') &&
      !optimized.includes('React.memo')) {
    
    const componentMatch = optimized.match(/export default function (\w+)/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      optimized = optimized.replace(
        `export default function ${componentName}`,
        `const ${componentName} = React.memo(function ${componentName}`
      );
      optimized = optimized.replace(/}\s*$/, '});\n\nexport default ' + componentName + ';');
    }
  }
  
  return optimized;
}

function enforceConsistencyPatterns(code: string): string {
  let consistent = code;
  
  // Consistent arrow function formatting
  consistent = consistent.replace(/=>\s*{/g, ' => {');
  consistent = consistent.replace(/=>{/g, ' => {');
  
  // Consistent import formatting
  consistent = consistent.replace(/import\s*{\s*([^}]+)\s*}\s*from/g, (match, imports) => {
    const cleanImports = imports.split(',').map((imp: string) => imp.trim()).join(', ');
    return `import { ${cleanImports} } from`;
  });
  
  return consistent;
}

function addSmartComments(code: string): string {
  let commented = code;
  
  // Add performance hints for expensive operations
  if (commented.includes('map(') && commented.includes('filter(')) {
    commented = commented.replace(
      /\.filter\([^)]+\)\.map\(/g,
      '.filter(/* Consider using useMemo for expensive operations */) .map('
    );
  }
  
  // Add accessibility hints
  if (commented.includes('<button') && !commented.includes('aria-label') && !commented.includes('// Accessibility')) {
    commented = commented.replace(
      /<button/g,
      '/* Consider adding aria-label for screen readers */\n    <button'
    );
  }
  
  return commented;
}
