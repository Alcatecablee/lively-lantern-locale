
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { ASTTransformer } from '../ast/ASTTransformer';

export interface SemanticContext {
  componentType: 'functional' | 'class' | 'hook' | 'utility';
  hasState: boolean;
  hasEffects: boolean;
  hasEventHandlers: boolean;
  imports: Map<string, string>; // local name -> source
  exports: string[];
  dependencies: string[];
  complexity: number;
  riskFactors: string[];
}

export interface SemanticConflict {
  type: 'state_mutation' | 'effect_dependency' | 'prop_drilling' | 'naming_collision' | 'circular_dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: { line: number; column: number };
  suggestion: string;
  autoFixable: boolean;
}

export class SemanticAnalyzer {
  private transformer = new ASTTransformer();

  analyzeCodeSemantics(code: string): SemanticContext {
    const ast = this.transformer.parse(code);
    if (!ast) {
      return this.createEmptyContext();
    }

    const context: SemanticContext = {
      componentType: 'utility',
      hasState: false,
      hasEffects: false,
      hasEventHandlers: false,
      imports: new Map(),
      exports: [],
      dependencies: [],
      complexity: 0,
      riskFactors: []
    };

    this.analyzeStructure(ast, context);
    this.analyzeComplexity(ast, context);
    this.analyzeRiskFactors(ast, context, code);

    return context;
  }

  detectSemanticConflicts(beforeContext: SemanticContext, afterContext: SemanticContext, layerName: string): SemanticConflict[] {
    const conflicts: SemanticConflict[] = [];

    // Check for state mutation conflicts
    if (!beforeContext.hasState && afterContext.hasState) {
      conflicts.push({
        type: 'state_mutation',
        severity: 'medium',
        description: `${layerName} introduced state to a previously stateless component`,
        location: { line: 1, column: 1 },
        suggestion: 'Consider if state addition is necessary or if it should be lifted up',
        autoFixable: false
      });
    }

    // Check for effect dependency conflicts
    if (afterContext.hasEffects && afterContext.complexity > beforeContext.complexity + 10) {
      conflicts.push({
        type: 'effect_dependency',
        severity: 'high',
        description: `${layerName} significantly increased complexity with effects`,
        location: { line: 1, column: 1 },
        suggestion: 'Break down complex effects or optimize dependencies',
        autoFixable: false
      });
    }

    // Check for naming collisions
    const newImports = new Set([...afterContext.imports.keys()].filter(k => !beforeContext.imports.has(k)));
    const existingImports = new Set(beforeContext.imports.keys());
    
    for (const newImport of newImports) {
      if (existingImports.has(newImport) && beforeContext.imports.get(newImport) !== afterContext.imports.get(newImport)) {
        conflicts.push({
          type: 'naming_collision',
          severity: 'critical',
          description: `Import name collision detected for '${newImport}'`,
          location: { line: 1, column: 1 },
          suggestion: `Use import aliasing or rename the conflicting import`,
          autoFixable: true
        });
      }
    }

    // Check for circular dependencies
    if (this.hasCircularDependency(afterContext.dependencies)) {
      conflicts.push({
        type: 'circular_dependency',
        severity: 'critical',
        description: 'Circular dependency detected in imports',
        location: { line: 1, column: 1 },
        suggestion: 'Refactor to remove circular imports',
        autoFixable: false
      });
    }

    return conflicts;
  }

  validateSemanticIntegrity(code: string, context: SemanticContext): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for common anti-patterns
    if (context.hasState && context.hasEffects && context.complexity > 50) {
      issues.push('Component has high complexity with both state and effects - consider splitting');
    }

    if (context.riskFactors.includes('direct_dom_manipulation') && context.componentType === 'functional') {
      issues.push('Direct DOM manipulation detected in functional component - use refs instead');
    }

    if (context.riskFactors.includes('inline_object_props') && context.hasState) {
      issues.push('Inline object props with state may cause unnecessary re-renders');
    }

    // Check for missing error boundaries
    if (context.riskFactors.includes('async_operations') && !context.riskFactors.includes('error_handling')) {
      issues.push('Async operations without proper error handling detected');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private analyzeStructure(ast: t.File, context: SemanticContext): void {
    traverse(ast, {
      // Analyze imports
      ImportDeclaration(path) {
        const source = path.node.source.value;
        path.node.specifiers.forEach(spec => {
          if (t.isImportDefaultSpecifier(spec)) {
            context.imports.set(spec.local.name, source);
          } else if (t.isImportSpecifier(spec)) {
            const importedName = t.isIdentifier(spec.imported) ? spec.imported.name : spec.imported.value;
            context.imports.set(spec.local.name, source);
          }
        });

        if (source.startsWith('./') || source.startsWith('../')) {
          context.dependencies.push(source);
        }
      },

      // Analyze exports
      ExportDefaultDeclaration(path) {
        if (t.isIdentifier(path.node.declaration)) {
          context.exports.push(path.node.declaration.name);
        } else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
          context.exports.push(path.node.declaration.id.name);
        }
      },

      // Analyze component type
      FunctionDeclaration(path) {
        const name = path.node.id?.name || '';
        if (name.match(/^[A-Z]/) || path.node.returnType?.type === 'TSTypeAnnotation') {
          context.componentType = 'functional';
        } else if (name.startsWith('use')) {
          context.componentType = 'hook';
        }
      },

      // Detect state usage
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const name = path.node.callee.name;
          if (name === 'useState' || name === 'useReducer') {
            context.hasState = true;
          }
          if (name === 'useEffect' || name === 'useLayoutEffect') {
            context.hasEffects = true;
          }
        }
      },

      // Detect event handlers
      JSXAttribute(path) {
        if (t.isJSXIdentifier(path.node.name) && path.node.name.name.startsWith('on')) {
          context.hasEventHandlers = true;
        }
      },

      // Detect class components
      ClassDeclaration(path) {
        if (path.node.superClass && t.isIdentifier(path.node.superClass) && 
            (path.node.superClass.name === 'Component' || path.node.superClass.name === 'PureComponent')) {
          context.componentType = 'class';
          context.hasState = true; // Assume class components have state
        }
      }
    });
  }

  private analyzeComplexity(ast: t.File, context: SemanticContext): void {
    let complexity = 0;

    traverse(ast, {
      // Conditional complexity
      IfStatement: () => complexity += 2,
      ConditionalExpression: () => complexity += 2,
      SwitchStatement: () => complexity += 1,
      
      // Loop complexity
      ForStatement: () => complexity += 3,
      WhileStatement: () => complexity += 3,
      DoWhileStatement: () => complexity += 3,
      
      // Function complexity
      FunctionDeclaration: () => complexity += 1,
      ArrowFunctionExpression: () => complexity += 1,
      
      // JSX complexity
      JSXElement: () => complexity += 1,
      
      // Logical operators
      LogicalExpression: () => complexity += 1
    });

    context.complexity = complexity;
  }

  private analyzeRiskFactors(ast: t.File, context: SemanticContext, code: string): void {
    const riskFactors: string[] = [];

    // Check for direct DOM manipulation
    if (code.includes('document.') || code.includes('window.')) {
      riskFactors.push('direct_dom_manipulation');
    }

    // Check for inline object props
    if (code.includes('={{') && code.includes('}}')) {
      riskFactors.push('inline_object_props');
    }

    // Check for async operations
    if (code.includes('async') || code.includes('await') || code.includes('.then(')) {
      riskFactors.push('async_operations');
    }

    // Check for error handling
    if (code.includes('try') || code.includes('catch') || code.includes('ErrorBoundary')) {
      riskFactors.push('error_handling');
    }

    // Check for performance concerns
    traverse(ast, {
      CallExpression(path) {
        if (t.isMemberExpression(path.node.callee) && 
            t.isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'map') {
          // Check if map is inside render without useMemo
          let isInRender = false;
          let hasUseMemo = false;
          
          path.findParent((parentPath) => {
            if (t.isReturnStatement(parentPath.node) || t.isJSXElement(parentPath.node)) {
              isInRender = true;
            }
            if (t.isCallExpression(parentPath.node) && t.isIdentifier(parentPath.node.callee) && 
                parentPath.node.callee.name === 'useMemo') {
              hasUseMemo = true;
            }
            return false;
          });
          
          if (isInRender && !hasUseMemo) {
            riskFactors.push('unoptimized_render_loops');
          }
        }
      }
    });

    context.riskFactors = riskFactors;
  }

  private hasCircularDependency(dependencies: string[]): boolean {
    // Simple heuristic - in a real implementation, this would be more sophisticated
    const depSet = new Set(dependencies);
    return dependencies.some(dep => {
      const relativePath = dep.replace('./', '').replace('../', '');
      return depSet.has(`../${relativePath}`) || depSet.has(`./${relativePath}`);
    });
  }

  private createEmptyContext(): SemanticContext {
    return {
      componentType: 'utility',
      hasState: false,
      hasEffects: false,
      hasEventHandlers: false,
      imports: new Map(),
      exports: [],
      dependencies: [],
      complexity: 0,
      riskFactors: []
    };
  }
}
