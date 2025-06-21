# NeuroLint

> **⚠️ BETA NOTICE**: NeuroLint is currently in beta (v1.0.0-beta). While core features are implemented and tested, you may encounter bugs or incomplete features. We appreciate your feedback and contributions!

NeuroLint is an intelligent code analysis and transformation tool that helps you maintain high-quality React and Next.js codebases through automated fixes and best practice enforcement.

## 🚀 Features

### Currently Implemented
- ✅ Intelligent code analysis and transformation
- ✅ Multi-layer fixing approach (6 layers of fixes)
- ✅ TypeScript and Next.js configuration optimization
- ✅ React component best practices enforcement
- ✅ Hydration and SSR issue prevention
- ✅ Automated accessibility improvements
- ✅ Command-line interface (CLI)
- ✅ VSCode extension (basic functionality)

### Under Development
- 🔄 Real-time collaborative fixing
- 🔄 Advanced test generation
- 🔄 Custom rule creation
- 🔄 Performance optimization suggestions
- 🔄 Integration with more CI/CD platforms

## 🛠️ Tech Stack

- **Core Engine**: TypeScript, AST Transformation
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Supabase
- **Extensions**: VS Code API
- **Testing**: Jest
- **CI/CD**: GitHub Actions

## 📦 Installation

### CLI
```bash
npm install -g @neurolint/cli
```

### VS Code Extension
Install from VS Code marketplace (coming soon)

### Web Interface
Visit [neurolint.dev](https://neurolint.dev) (coming soon)

## 🚦 Getting Started

1. Install the CLI:
```bash
npm install -g @neurolint/cli
```

2. Initialize in your project:
```bash
neurolint init
```

3. Run the fixer:
```bash
neurolint fix
```

For detailed usage instructions, see our [Getting Started Guide](docs/getting-started.md).

## 📚 Documentation

- [CLI Documentation](cli/README.md)
- [VS Code Extension Guide](vscode-extension/README.md)
- [Technical Documentation](TECHNICAL_DOCS.md)
- [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)

## 🔄 Under Development

The following features are actively being developed:

1. **Advanced Analysis**
   - Deep learning-based code understanding
   - Context-aware transformations
   - Performance impact analysis

2. **Collaboration Features**
   - Team-based configuration sharing
   - Custom rule sharing
   - Fix suggestions and voting

3. **Integration Expansions**
   - Additional IDE plugins
   - More CI/CD platform integrations
   - Custom workflow automation

4. **Performance Optimizations**
   - Parallel processing improvements
   - Caching mechanisms
   - Incremental analysis

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Special thanks to our contributors and the open-source community.

Its official: NeuroLint now has CLI and VSCode!!

# NeuroLint CLI

A command-line interface for the NeuroLint automated code fixing system.

## Installation

### Option 1: Direct Installation
```bash
npm install -g neurolint-cli
```

### Option 2: From Source
```bash
git clone <your-repo>
cd neurolint/cli
npm install
npm link
```

## Quick Start

```bash
# Initialize in your project
neurolint init

# Fix all files in current directory
neurolint fix

# Fix a specific file
neurolint fix src/components/MyComponent.tsx

# Preview changes without applying them
neurolint fix --dry-run

# Run only specific layers
neurolint fix --layers 1,2,3

# Verbose output
neurolint fix --verbose

# Create backups before fixing
neurolint fix --backup
```

## Commands

### `neurolint fix [target]`
Fix code issues in files or directories.

**Arguments:**
- `target` - File or directory to fix (default: current directory)

**Options:**
- `-l, --layers <layers>` - Comma-separated list of layers (1,2,3,4)
- `-d, --dry-run` - Preview changes without applying them
- `-v, --verbose` - Show detailed output
- `-b, --backup` - Create backup files before fixing
- `--exclude <patterns>` - Exclude file patterns

**Examples:**
```bash
neurolint fix src/                          # Fix entire src directory
neurolint fix MyComponent.tsx               # Fix single file
neurolint fix --layers 1,2 --dry-run      # Preview config & pattern fixes
neurolint fix --exclude "*.test.js,*.spec.js" # Exclude test files
```

### `neurolint test`
Run the built-in test suite to verify the fixing logic.

**Options:**
- `-v, --verbose` - Show detailed test output

### `neurolint init`
Initialize NeuroLint configuration in the current project.

Creates a `neurolint.config.json` file with default settings.

## Layers

1. **Configuration Validation** - Updates tsconfig.json, next.config.js, package.json
2. **Pattern & Entity Fixes** - Fixes HTML entities, modernizes JS patterns
3. **Component Best Practices** - Adds missing keys, imports, accessibility
4. **Hydration & SSR Guards** - Prevents SSR/hydration issues

## Configuration File

Create `neurolint.config.json` in your project root:

```json
{
  "layers": [1, 2, 3, 4],
  "exclude": [
    "node_modules/**",
    "dist/**",
    ".next/**",
    "build/**",
    "*.min.js"
  ],
  "include": [
    "src/**/*.{ts,tsx,js,jsx}",
    "*.{ts,tsx,js,jsx,json}"
  ],
  "backup": true,
  "verbose": false
}
```

## Integration with CI/CD

Add to your package.json scripts:

```json
{
  "scripts": {
    "lint:fix": "neurolint fix src/",
    "lint:check": "neurolint fix --dry-run",
    "precommit": "neurolint fix --backup"
  }
}
```

## Common Use Cases

### Daily Development
```bash
# Quick fix before committing
neurolint fix --backup

# Check what would be fixed
neurolint fix --dry-run
```

### Code Reviews
```bash
# Fix only critical issues (config + patterns)
neurolint fix --layers 1,2

# Generate detailed report
neurolint fix --verbose --dry-run > fixes-needed.txt
```

### CI Pipeline
```bash
# Automated fixing in CI
neurolint fix
neurolint test  # Verify fixes work correctly
```

## Troubleshooting

### No files found
- Check your include/exclude patterns in config
- Make sure you're in the right directory
- Use `--verbose` to see what files are being processed

### Permission errors
- Run with `sudo` if needed for global installation
- Check file permissions in your project

### Unexpected changes
- Use `--dry-run` first to preview changes
- Use `--backup` to create safety copies
- Run specific layers with `--layers` to isolate issues

## Support

- Report issues on GitHub
- Check the test suite with `neurolint test`
- Use `--verbose` for debugging output


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
