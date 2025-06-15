
import * as t from '@babel/types';
import traverse from '@babel/traverse';

export function fixAccessibilityAttributesAST(ast: t.File): void {
  try {
    traverse(ast, {
      JSXElement(path) {
        const element = path.node;
        const openingElement = element.openingElement;
        
        if (t.isJSXIdentifier(openingElement.name)) {
          const tagName = openingElement.name.name;
          
          // Add alt to images if missing
          if (tagName === 'img') {
            const hasAlt = openingElement.attributes.some(attr =>
              t.isJSXAttribute(attr) && 
              t.isJSXIdentifier(attr.name) && 
              attr.name.name === 'alt'
            );
            
            if (!hasAlt) {
              openingElement.attributes.push(
                t.jsxAttribute(t.jsxIdentifier('alt'), t.stringLiteral(''))
              );
            }
          }
          
          // Add aria-label to buttons without existing aria attributes or meaningful text content
          if (tagName === 'button') {
            const hasAriaLabel = openingElement.attributes.some(attr =>
              t.isJSXAttribute(attr) && 
              t.isJSXIdentifier(attr.name) && 
              (attr.name.name === 'aria-label' || attr.name.name === 'aria-labelledby')
            );
            
            if (!hasAriaLabel) {
              // Check if button has meaningful text content
              const hasTextContent = element.children.some(child => {
                if (t.isJSXText(child)) {
                  return child.value.trim() !== '';
                }
                // For JSX expressions, assume they provide meaningful content
                return t.isJSXExpressionContainer(child);
              });
              
              // Only add aria-label if there's no meaningful text content
              if (!hasTextContent) {
                openingElement.attributes.push(
                  t.jsxAttribute(t.jsxIdentifier('aria-label'), t.stringLiteral('Button'))
                );
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.warn('Error fixing accessibility attributes:', error);
  }
}
