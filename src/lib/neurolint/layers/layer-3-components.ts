import { addMissingImports } from "./layer-3-components/missing-imports";
import { fixMissingKeyProps } from "./layer-3-components/missing-keys";
import { fixAccessibilityAttributes } from "./layer-3-components/accessibility";
import { fixComponentPropTypes } from "./layer-3-components/prop-types";

export async function transform(code: string): Promise<string> {
  let transformed = code;

  // Basic malformed JSX recovery - handle obvious unclosed tags
  transformed = fixMalformedJSX(transformed);

  // Apply component-specific fixes in safe order
  transformed = addMissingImports(transformed);
  transformed = fixMissingKeyProps(transformed);
  transformed = fixAccessibilityAttributes(transformed);
  transformed = fixComponentPropTypes(transformed);

  return transformed;
}

function fixMalformedJSX(code: string): string {
  // Simple fixes for obvious unclosed tags - be very conservative
  let fixed = code;

  // Fix unclosed <p> tags followed by <span>
  fixed = fixed.replace(/<p>([^<]*)\s*<span>/g, "<p>$1</p>\n    <span>");

  // Fix missing closing </div> if we can detect the pattern
  const lines = fixed.split("\n");
  let openDivs = 0;
  let needsClosing = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openTags = (line.match(/<div[^>]*>/g) || []).length;
    const closeTags = (line.match(/<\/div>/g) || []).length;
    openDivs += openTags - closeTags;

    // If we're at the end of a function and have unclosed divs, try to close them
    if (line.includes(");") && openDivs > 0) {
      lines[i] = lines[i].replace(/\);/, "  </div>\n);");
      openDivs--;
      needsClosing = true;
    }
  }

  if (needsClosing) {
    fixed = lines.join("\n");
  }

  return fixed;
}
