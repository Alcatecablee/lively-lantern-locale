
export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply component-specific fixes
  transformed = fixButtonComponents(transformed);
  transformed = fixMissingKeyProps(transformed);
  transformed = fixComponentPropTypes(transformed);
  transformed = fixAccessibilityAttributes(transformed);
  transformed = addMissingImports(transformed);
  transformed = fixForwardRefComponents(transformed);
  
  return transformed;
}

function fixButtonComponents(code: string): string {
  // Ensure Button components have proper variant props
  return code.replace(
    /<Button\s+([^>]*?)>/g,
    (match, props) => {
      if (!props.includes('variant=')) {
        return `<Button variant="default" ${props}>`;
      }
      
      // Fix common variant naming issues
      const fixedProps = props
        .replace(/variant="primary"/g, 'variant="default"')
        .replace(/variant="danger"/g, 'variant="destructive"')
        .replace(/variant="success"/g, 'variant="default"');
      
      return `<Button ${fixedProps}>`;
    }
  );
}

function fixMissingKeyProps(code: string): string {
  // Add key props to mapped elements
  return code.replace(
    /\.map\(\(([^,)]+)(?:,\s*(\w+))?\)\s*=>\s*<(\w+)([^>]*?)>/g,
    (match, item, index, component, props) => {
      if (props.includes('key=')) return match;
      
      const keyProp = index 
        ? `key={\`${component}-\${${index}}-\${${item}.id || ${item}}\`}`
        : `key={${item}.id || ${item}}`;
      
      return `.map((${item}${index ? `, ${index}` : ''}) => <${component} ${keyProp}${props}>`;
    }
  );
}

function fixComponentPropTypes(code: string): string {
  // Add interface definitions for components missing them
  const componentMatch = code.match(/export default function (\w+)\(\s*{\s*([^}]+)\s*}/);
  if (componentMatch && !code.includes('interface') && !code.includes('type Props')) {
    const [, componentName, props] = componentMatch;
    const propNames = props.split(',').map(p => p.trim().split(':')[0].trim());
    
    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map(prop => `${prop}: any;`).join('\n  ')}
}

`;
    
    return interfaceDefinition + code.replace(
      `export default function ${componentName}({ ${props} }`,
      `export default function ${componentName}({ ${props} }: ${componentName}Props`
    );
  }
  
  return code;
}

function fixAccessibilityAttributes(code: string): string {
  // Add aria-label to buttons without them
  let fixed = code.replace(
    /<button([^>]*?)>/g,
    (match, attributes) => {
      if (!attributes.includes('aria-label') && !attributes.includes('aria-labelledby')) {
        // Try to extract button text content for a meaningful label
        const onClick = attributes.match(/onClick=\{([^}]+)\}/);
        const className = attributes.match(/className="([^"]+)"/);
        
        let label = 'Button';
        if (className && className[1].includes('close')) label = 'Close';
        else if (className && className[1].includes('submit')) label = 'Submit';
        else if (onClick) label = 'Interactive button';
        
        return `<button${attributes} aria-label="${label}">`;
      }
      return match;
    }
  );
  
  // Add alt text to images without it
  fixed = fixed.replace(
    /<img([^>]*?)>/g,
    (match, attributes) => {
      if (!attributes.includes('alt=')) {
        return `<img${attributes} alt="">`;
      }
      return match;
    }
  );
  
  return fixed;
}

function addMissingImports(code: string): string {
  const imports = new Set<string>();
  const existingImports = code.match(/import.*from.*['"][^'"]+['"]/g) || [];
  const existingImportNames = existingImports.join(' ');
  
  // Common component imports that might be missing
  const componentChecks = [
    { component: 'Button', from: '@/components/ui/button', pattern: /<Button/ },
    { component: 'Input', from: '@/components/ui/input', pattern: /<Input/ },
    { component: 'Label', from: '@/components/ui/label', pattern: /<Label/ },
    { component: 'Card', from: '@/components/ui/card', pattern: /<Card/ },
    { component: 'Tabs', from: '@/components/ui/tabs', pattern: /<Tabs/ },
    { component: 'Dialog', from: '@/components/ui/dialog', pattern: /<Dialog/ },
    { component: 'Select', from: '@/components/ui/select', pattern: /<Select/ },
    { component: 'Form', from: '@/components/ui/form', pattern: /<Form/ },
  ];
  
  componentChecks.forEach(({ component, from, pattern }) => {
    if (pattern.test(code) && !existingImportNames.includes(component)) {
      imports.add(`import { ${component} } from "${from}";`);
    }
  });
  
  // React hooks
  const hookChecks = [
    { hook: 'useState', pattern: /useState\(/ },
    { hook: 'useEffect', pattern: /useEffect\(/ },
    { hook: 'useCallback', pattern: /useCallback\(/ },
    { hook: 'useMemo', pattern: /useMemo\(/ },
    { hook: 'useRef', pattern: /useRef\(/ },
  ];
  
  const reactHooks = hookChecks
    .filter(({ pattern }) => pattern.test(code))
    .map(({ hook }) => hook);
  
  if (reactHooks.length > 0 && !existingImportNames.includes('useState')) {
    imports.add(`import { ${reactHooks.join(', ')} } from 'react';`);
  }
  
  if (imports.size > 0) {
    const importStatements = Array.from(imports).join('\n');
    const firstImportIndex = code.indexOf('import');
    if (firstImportIndex !== -1) {
      return code.slice(0, firstImportIndex) + importStatements + '\n' + code.slice(firstImportIndex);
    } else {
      return importStatements + '\n\n' + code;
    }
  }
  
  return code;
}

function fixForwardRefComponents(code: string): string {
  // Add displayName to forwardRef components
  return code.replace(
    /(const (\w+) = forwardRef[^}]+\}\);?)/g,
    '$1\n$2.displayName = "$2";'
  );
}
