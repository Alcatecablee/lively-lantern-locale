
# NeuroLint VSCode Extension

Automated code fixing for React/Next.js projects using AI-powered transformations, directly in your VSCode editor.

## Features

- **Transform Current File**: Apply NeuroLint transformations to the currently open file
- **Transform Selection**: Transform only the selected code
- **Transform Workspace**: Bulk transform multiple files in your workspace
- **Layer Selection**: Choose which transformation layers to apply
- **Diff Preview**: Preview changes before applying them
- **Real-time Progress**: See transformation progress with detailed feedback

## Supported File Types

- JavaScript (.js)
- TypeScript (.ts)
- React/JSX (.jsx, .tsx)
- JSON (.json)

## Available Transformation Layers

1. **Configuration Validation** - Optimizes TypeScript, Next.js config, and package.json
2. **Pattern & Entity Fixes** - Cleans up HTML entities and modernizes code patterns
3. **Component Best Practices** - Fixes missing key props, accessibility, and imports
4. **Hydration & SSR Guard** - Fixes hydration bugs and adds SSR protection

## Usage

### Transform Current File
- Right-click in the editor → "Transform Current File"
- Or use Command Palette: `Ctrl+Shift+P` → "NeuroLint: Transform Current File"

### Transform Selection
- Select code in the editor
- Right-click → "Transform Selection"
- Or use Command Palette: `Ctrl+Shift+P` → "NeuroLint: Transform Selection"

### Configure Layers
- Click the "NeuroLint" button in the status bar
- Or use Command Palette: `Ctrl+Shift+P` → "NeuroLint: Select Transformation Layers"

### Transform Multiple Files
- Use Command Palette: `Ctrl+Shift+P` → "NeuroLint: Transform Workspace Files"
- Select files from the quick pick menu

## Configuration

Open VSCode settings and search for "NeuroLint":

- `neurolint.enabledLayers`: Array of layer IDs to enable (default: [1,2,3,4])
- `neurolint.useAST`: Use AST-based transformations when available (default: true)
- `neurolint.showDiffPreview`: Show diff preview before applying changes (default: true)

## Requirements

- VSCode 1.74.0 or higher
- Node.js 16.0.0 or higher

## Installation

1. Install from VSCode Marketplace
2. Or install manually:
   ```bash
   cd vscode-extension
   npm install
   npm run compile
   code --install-extension neurolint-vscode-1.0.0.vsix
   ```

## Development

```bash
cd vscode-extension
npm install
npm run compile
# Press F5 in VSCode to launch Extension Development Host
```

## License

MIT
