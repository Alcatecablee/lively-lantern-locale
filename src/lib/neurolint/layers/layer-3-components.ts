
import { addMissingImports } from './layer-3-components/missing-imports';
import { fixMissingKeyProps } from './layer-3-components/missing-keys';
import { fixAccessibilityAttributes } from './layer-3-components/accessibility';
import { fixComponentPropTypes } from './layer-3-components/prop-types';

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  // Apply component-specific fixes in safe order
  transformed = addMissingImports(transformed);
  transformed = fixMissingKeyProps(transformed);
  transformed = fixAccessibilityAttributes(transformed);
  transformed = fixComponentPropTypes(transformed);
  
  return transformed;
}
