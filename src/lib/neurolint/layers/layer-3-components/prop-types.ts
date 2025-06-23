export function fixComponentPropTypes(code: string): string {
  let fixed = code;

  // Handle arrow function components: const ComponentName = ({ props }) =>
  const arrowComponentMatch = fixed.match(
    /const\s+(\w+)\s*=\s*\(\s*{\s*([^}]+)\s*}\s*\)\s*=>/,
  );
  if (
    arrowComponentMatch &&
    !fixed.includes("interface") &&
    !fixed.includes("type Props")
  ) {
    const [fullMatch, componentName, props] = arrowComponentMatch;
    const propNames = props.split(",").map((p) => p.trim());

    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map((prop) => `${prop}: string;`).join("\n  ")}
}

`;

    fixed =
      interfaceDefinition +
      fixed.replace(
        fullMatch,
        `const ${componentName} = ({ ${props} }: ${componentName}Props) =>`,
      );

    return fixed;
  }

  // Handle regular function components: function ComponentName({ props })
  const functionComponentMatch = fixed.match(
    /function\s+(\w+)\(\s*{\s*([^}]+)\s*}/,
  );
  if (
    functionComponentMatch &&
    !fixed.includes("interface") &&
    !fixed.includes("type Props")
  ) {
    const [, componentName, props] = functionComponentMatch;
    const propNames = props.split(",").map((p) => p.trim());

    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map((prop) => `${prop}: string;`).join("\n  ")}
}

`;

    fixed =
      interfaceDefinition +
      fixed.replace(
        `function ${componentName}({ ${props} }`,
        `function ${componentName}({ ${props} }: ${componentName}Props`,
      );
  }

  return fixed;
}
