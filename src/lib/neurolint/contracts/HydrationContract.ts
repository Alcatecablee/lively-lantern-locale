
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { TransformationContract, ValidationRule } from './TransformationContract';
import { QualityGates } from './QualityGates';

export const hydrationContract: TransformationContract = {
  name: 'Hydration Layer Contract',
  
  preconditions: [
    {
      name: 'Valid Syntax',
      check: (code) => QualityGates.validateSyntax(code).valid,
      errorMessage: 'Code must have valid syntax before hydration fixes'
    },
    {
      name: 'Not Already SSR Protected',
      check: (code) => {
        // Check if localStorage calls are already wrapped
        const alreadyWrapped = /typeof window !== "undefined".*localStorage/g.test(code);
        return !alreadyWrapped;
      },
      errorMessage: 'localStorage calls appear to already be SSR protected'
    }
  ],

  postconditions: [
    {
      name: 'Valid Syntax After Transform',
      check: (code) => QualityGates.validateSyntax(code).valid,
      errorMessage: 'Transformed code must maintain valid syntax'
    },
    {
      name: 'No Double Wrapping',
      check: (code) => QualityGates.validateNoDoubleWrapping(code),
      errorMessage: 'SSR guards must not be double-wrapped'
    },
    {
      name: 'localStorage Properly Protected',
      check: (code) => {
        // If code has localStorage, it should be protected
        if (!code.includes('localStorage')) return true;
        
        // Check that all localStorage calls are protected
        const unprotectedPattern = /(?<!typeof window[^;]*?)localStorage\./g;
        const unprotectedMatches = code.match(unprotectedPattern) || [];
        
        // Filter out matches that are actually protected by checking context
        const reallyUnprotected = unprotectedMatches.filter(match => {
          const index = code.indexOf(match);
          const before = code.substring(Math.max(0, index - 50), index);
          return !before.includes('typeof window') && !before.includes('window !==');
        });
        
        return reallyUnprotected.length === 0;
      },
      errorMessage: 'All localStorage calls must be protected with SSR guards'
    }
  ],

  fingerprint: (ast: t.File) => {
    const features: string[] = [];
    
    traverse(ast, {
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'localStorage'
        ) {
          features.push(`localStorage:${path.node.callee.property.name}`);
        }
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useState') {
          features.push('useState');
        }
      },
      ConditionalExpression(path) {
        if (
          t.isBinaryExpression(path.node.test) &&
          t.isUnaryExpression(path.node.test.left) &&
          t.isIdentifier(path.node.test.left.argument) &&
          path.node.test.left.argument.name === 'window'
        ) {
          features.push('ssrGuard');
        }
      }
    });
    
    return features.sort().join('|');
  },

  rollback: (code: string) => {
    // Remove SSR guards if transformation failed
    return code
      .replace(/typeof window !== "undefined" \? ([^:]+) : [^,}]+/g, '$1')
      .replace(/typeof window !== "undefined" && /g, '');
  }
};
