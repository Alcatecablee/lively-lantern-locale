
import * as t from '@babel/types';

export function addComponentInterfacesAST(ast: t.File): void {
  try {
    const functionsToProcess: Array<{func: t.FunctionDeclaration, index: number}> = [];
    
    // First pass: collect functions that need interfaces
    ast.program.body.forEach((stmt, index) => {
      if (t.isFunctionDeclaration(stmt) && stmt.params.length > 0) {
        const firstParam = stmt.params[0];
        if (t.isObjectPattern(firstParam) && stmt.id) {
          const componentName = stmt.id.name;
          const interfaceName = `${componentName}Props`;
          
          // Check if interface already exists
          const hasInterface = ast.program.body.some(s =>
            t.isTSInterfaceDeclaration(s) && s.id.name === interfaceName
          );
          
          if (!hasInterface) {
            functionsToProcess.push({func: stmt, index});
          }
        }
      }
    });
    
    // Second pass: add interfaces (in reverse order to maintain indices)
    functionsToProcess.reverse().forEach(({func, index}) => {
      if (func.id && func.params[0] && t.isObjectPattern(func.params[0])) {
        const componentName = func.id.name;
        const interfaceName = `${componentName}Props`;
        const firstParam = func.params[0];
        
        const props = firstParam.properties.map(prop => {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            return t.tsPropertySignature(
              t.identifier(prop.key.name),
              t.tsTypeAnnotation(t.tsAnyKeyword())
            );
          }
          return null;
        }).filter(Boolean) as t.TSPropertySignature[];
        
        const interfaceDecl = t.tsInterfaceDeclaration(
          t.identifier(interfaceName),
          null,
          null,
          t.tsInterfaceBody(props)
        );
        
        // Add interface before the function
        ast.program.body.splice(index, 0, interfaceDecl);
        
        // Update function parameter type
        firstParam.typeAnnotation = t.tsTypeAnnotation(
          t.tsTypeReference(t.identifier(interfaceName))
        );
      }
    });
  } catch (error) {
    console.warn('Error adding component interfaces:', error);
  }
}
