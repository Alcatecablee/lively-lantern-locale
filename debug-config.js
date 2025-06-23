// Quick diagnostic script for Layer 1 config
import { transform } from "./src/lib/neurolint/layers/layer-1-config.ts";

const testInput = `{
  "compilerOptions": {
    "target": "es5",
    "strict": true
  }
}`;

console.log("Testing Layer 1 Config Transform...");
console.log("Input:", testInput);

transform(testInput)
  .then((result) => {
    console.log("Output:", result);
    console.log("Changed?", result !== testInput);
    console.log("Contains ES2022?", result.includes("ES2022"));
  })
  .catch((err) => {
    console.error("Error:", err);
  });
