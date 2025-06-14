
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { TransformationContract, ValidationRule } from './TransformationContract';
import { QualityGates } from './QualityGates';

export const componentsContract: TransformationContract = {
  name: 'Components Layer Contract',
  
  preconditions: [
    {
      name: 'Valid Syntax',
      check: (code) => QualityGates.validateSyntax(code).valid,
      errorMessage: 'Code must have valid syntax before component transformations'
    },
    {
      name: 'Not Already Processed',
      check: (code, ast) => {
        if (!ast) return true;
        
        // Check if component interfaces are already added
        let hasGeneratedInterface = false;
        traverse(ast, {
          TSInterfaceDeclaration(path) {
            if (path.node.id.name.endsWith('Props')) {
              // Check if it looks like an auto-generated interface
              const hasOnlyAnyTypes = path.node.body.body.every(member => 
                t.isTSPropertySignature(member) && 
                member.typeAnnotation &&
                t.isTSTypeAnnotation(member.typeAnnotation) &&
                t.isTSAnyKeyword(member.typeAnnotation.typeAnnotation)
              );
              if (hasOnlyAnyTypes) {
                hasGeneratedInterface = true;
              }
            }
          }
        });
        return !hasGeneratedInterface;
      },
      errorMessage: 'Component appears to already have generated interfaces'
    }
  ],

  postconditions: [
    {
      name: 'Valid Syntax After Transform',
      check: (code) => QualityGates.validateSyntax(code).valid,
      errorMessage: 'Transformed code must maintain valid syntax'
    },
    {
      name: 'No Malformed Event Handlers',
      check: (code) => QualityGates.validateNoMalformedEventHandlers(code),
      errorMessage: 'Event handlers must be properly formed'
    },
    {
      name: 'Import Integrity',
      check: (code) => QualityGates.validateImportIntegrity(code),
      errorMessage: 'All used React hooks must be properly imported'
    }
  ],

  fingerprint: (ast: t.File) => {
    const features: string[] = [];
    
    traverse(ast, {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name.startsWith('use')) {
          features.push(`hook:${path.node.callee.name}`);
        }
      },
      JSXElement(path) {
        if (t.isJSXIdentifier(path.node.openingElement.name)) {
          features.push(`jsx:${path.node.openingElement.name.name}`);
        }
      },
      TSInterfaceDeclaration(path) {
        features.push(`interface:${path.node.id.name}`);
      }
    });
    
    return features.sort().join('|');
  }
};
