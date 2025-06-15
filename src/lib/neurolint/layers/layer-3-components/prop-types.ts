
export function fixComponentPropTypes(code: string): string {
  // Add TypeScript interface for components with props
  const componentMatch = code.match(/function\s+(\w+)\(\s*{\s*([^}]+)\s*}/);
  if (componentMatch && !code.includes('interface') && !code.includes('type Props')) {
    const [, componentName, props] = componentMatch;
    const propNames = props.split(',').map(p => p.trim().split(':')[0].trim());
    
    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map(prop => `${prop}: any;`).join('\n  ')}
}

`;
    
    return interfaceDefinition + code.replace(
      `function ${componentName}({ ${props} }`,
      `function ${componentName}({ ${props} }: ${componentName}Props`
    );
  }
  
  return code;
}
