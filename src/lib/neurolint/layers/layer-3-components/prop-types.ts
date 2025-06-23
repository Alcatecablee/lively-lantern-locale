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
    try {
      const [fullMatch, componentName, props] = arrowComponentMatch;
      const propNames = props
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (propNames.length > 0) {
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
      }

      return fixed;
    } catch (e) {
      // If anything goes wrong, return original
      return code;
    }
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
