# NeuroLint VS Code Extension

> **⚠️ BETA NOTICE**: This extension is currently in beta. While core features are implemented and tested, you may encounter bugs or incomplete features.

## Features

### Currently Implemented
- ✅ Code analysis and fix suggestions
- ✅ Quick fixes for common issues
- ✅ Configuration management
- ✅ Layer selection interface
- ✅ Basic diff preview

### Coming Soon
- 🔄 Real-time suggestions
- 🔄 Interactive fix application
- 🔄 Custom rule editor
- 🔄 Team configuration sharing
- 🔄 Advanced diff visualization

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

### Quick Start
1. Open a React/Next.js project
2. Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Type "NeuroLint" to see available commands

### Available Commands
- `NeuroLint: Fix Current File`
- `NeuroLint: Fix Project`
- `NeuroLint: Show Layer Selector`
- `NeuroLint: Show Diff Preview`

### Keyboard Shortcuts
- Fix Current File: `Ctrl+Alt+N` (`Cmd+Alt+N` on macOS)
- Show Layer Selector: `Ctrl+Alt+L` (`Cmd+Alt+L` on macOS)

## Features in Detail

### Code Analysis
- Real-time code analysis
- Inline problem indicators
- Quick fix suggestions

### Layer Selection
- Visual layer selection interface
- Layer-specific fixes
- Custom layer combinations

### Diff Preview
- Side-by-side diff view
- Accept/reject changes
- Batch fix application

## Configuration

### Extension Settings
```json
{
  "neurolint.enableAutoFix": true,
  "neurolint.layers": [1, 2, 3, 4, 5, 6],
  "neurolint.showInlineHints": true,
  "neurolint.createBackups": true
}
```

### Project Configuration
The extension uses your project's `neurolint.config.json`. If not present, it will use default settings.

## Requirements

- VSCode 1.74.0 or higher
- Node.js 16.0.0 or higher

## Installation

1. Download from VS Code Marketplace (coming soon)
2. Or install from VSIX file:
   - Download latest release
   - Install via VS Code Extensions view
   - Run `code --install-extension neurolint-vscode.vsix`

## Development

```bash
cd vscode-extension
npm install
npm run compile
# Press F5 in VSCode to launch Extension Development Host
```

## Troubleshooting

### Common Issues

#### Extension Not Activating
- Ensure you're in a React/Next.js project
- Check if `neurolint.config.json` exists
- Verify file types are supported

#### Fixes Not Applying
- Check extension settings
- Verify file permissions
- Look for error messages in Output panel

#### Performance Issues
- Disable real-time analysis
- Reduce active layers
- Check workspace size

### Getting Help
- Check Output panel (`View -> Output -> NeuroLint`)
- Review error messages
- Submit issues on GitHub

## Planned Features

### v1.1.0
- Real-time suggestions
- Enhanced diff preview
- Custom rule editor

### v1.2.0
- Team configuration sharing
- Advanced visualization
- Performance improvements

### v2.0.0
- AI-powered suggestions
- Real-time collaboration
- Advanced customization

## Contributing

We welcome contributions! See our [Contributing Guide](../CONTRIBUTING.md).

## License

MIT License - see [LICENSE](../LICENSE) for details.
