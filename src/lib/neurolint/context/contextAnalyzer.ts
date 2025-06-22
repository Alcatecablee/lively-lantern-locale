
interface FileContext {
  type: 'component' | 'page' | 'hook' | 'utility' | 'config' | 'test';
  framework: 'react' | 'nextjs' | 'vanilla';
  features: string[];
  dependencies: string[];
  patterns: string[];
}

export class ContextAnalyzer {
  static analyzeFile(code: string, filePath?: string): FileContext {
    const context: FileContext = {
      type: this.detectFileType(code, filePath),
      framework: this.detectFramework(code),
      features: this.detectFeatures(code),
      dependencies: this.extractDependencies(code),
      patterns: this.detectPatterns(code)
    };
    
    return context;
  }
  
  private static detectFileType(code: string, filePath?: string): FileContext['type'] {
    if (filePath) {
      if (filePath.includes('/pages/') || filePath.includes('/app/')) return 'page';
      if (filePath.includes('/hooks/') || filePath.startsWith('use')) return 'hook';
      if (filePath.includes('/components/')) return 'component';
      if (filePath.includes('/lib/') || filePath.includes('/utils/')) return 'utility';
      if (filePath.includes('.config.') || filePath.includes('tsconfig')) return 'config';
      if (filePath.includes('.test.') || filePath.includes('.spec.')) return 'test';
    }
    
    // Analyze code patterns
    if (code.includes('export default function') && code.includes('JSX')) return 'component';
    if (code.includes('use') && code.includes('useState')) return 'hook';
    if (code.includes('describe(') || code.includes('it(')) return 'test';
    
    return 'utility';
  }
  
  private static detectFramework(code: string): FileContext['framework'] {
    if (code.includes('next/') || code.includes('useRouter') || code.includes("'use client'")) {
      return 'nextjs';
    }
    if (code.includes('react') || code.includes('useState') || code.includes('useEffect')) {
      return 'react';
    }
    return 'vanilla';
  }
  
  private static detectFeatures(code: string): string[] {
    const features: string[] = [];
    
    if (code.includes('useState')) features.push('state-management');
    if (code.includes('useEffect')) features.push('side-effects');
    if (code.includes('localStorage')) features.push('browser-storage');
    if (code.includes('fetch(') || code.includes('axios')) features.push('api-calls');
    if (code.includes('useRouter')) features.push('routing');
    if (code.includes('form') || code.includes('input')) features.push('forms');
    if (code.includes('onClick') || code.includes('onChange')) features.push('event-handling');
    if (code.includes('className') || code.includes('tailwind')) features.push('styling');
    if (code.includes('async') || code.includes('await')) features.push('async-operations');
    if (code.includes('map(') && code.includes('<')) features.push('list-rendering');
    
    return features;
  }
  
  private static extractDependencies(code: string): string[] {
    const importRegex = /import.*from\s+['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      dependencies.push(match[1]);
    }
    
    return dependencies;
  }
  
  private static detectPatterns(code: string): string[] {
    const patterns: string[] = [];
    
    if (code.includes('try {') && code.includes('catch')) patterns.push('error-handling');
    if (code.includes('useMemo') || code.includes('useCallback')) patterns.push('performance-optimization');
    if (code.includes('aria-') || code.includes('role=')) patterns.push('accessibility');
    if (code.includes('data-testid')) patterns.push('testing-ready');
    if (code.includes('// TODO') || code.includes('// FIXME')) patterns.push('has-todos');
    
    return patterns;
  }
  
  static getContextualRecommendations(context: FileContext): string[] {
    const recommendations: string[] = [];
    
    // Context-specific recommendations
    if (context.type === 'component') {
      if (!context.features.includes('accessibility')) {
        recommendations.push('Add accessibility attributes (aria-label, alt text)');
      }
      if (context.features.includes('list-rendering') && !context.patterns.includes('performance-optimization')) {
        recommendations.push('Consider using React.memo or useMemo for list rendering');
      }
    }
    
    if (context.type === 'page' && context.framework === 'nextjs') {
      if (!context.dependencies.includes('next/head')) {
        recommendations.push('Add Next.js Head component for SEO');
      }
      if (context.features.includes('browser-storage') && !code.includes("'use client'")) {
        recommendations.push("Add 'use client' directive for browser APIs");
      }
    }
    
    if (context.features.includes('api-calls') && !context.patterns.includes('error-handling')) {
      recommendations.push('Add error handling for API calls');
    }
    
    if (context.features.includes('forms') && !context.features.includes('validation')) {
      recommendations.push('Add form validation');
    }
    
    return recommendations;
  }
}
