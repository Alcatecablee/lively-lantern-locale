import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {languageOptions: { globals: globals.browser }},
  ...tseslint.configs.recommended,
  {files: ["**/*.jsx"], languageOptions: {parserOptions: {ecmaFeatures: {jsx: true}}}},
  {
    plugins: {
      react: pluginReact
    },
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { "allowShortCircuit": true }
      ]
    }
  }
];
