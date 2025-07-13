# 🧠 NeuroLint CLI

A sophisticated multi-layer automated code fixing system for React/Next.js projects. NeuroLint intelligently analyzes your codebase and applies targeted fixes across 6 specialized layers.

## 🚀 Quick Start

```bash
# Install globally
npm install -g @neurolint/cli

# Or run directly
npx @neurolint/cli fix

# Auto-detect and fix issues in src/ directory
neurolint fix

# Preview changes without applying them
neurolint fix --dry-run

# Run with detailed output
neurolint fix --verbose
```

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g @neurolint/cli
```

### Local Project Installation
```bash
npm install --save-dev @neurolint/cli
```

### From Source
```bash
git clone https://github.com/neurolint/cli.git
cd cli
npm install
npm run install
npm link
```

## 🎯 Commands

### 🔧 Fix Command
The main command that automatically detects and fixes code issues.

```bash
# Basic usage
neurolint fix [target]

# Examples
neurolint fix                           # Fix src/ directory
neurolint fix src/components/           # Fix specific directory
neurolint fix src/App.tsx              # Fix single file
neurolint fix "src/**/*.{ts,tsx}"      # Fix with glob pattern
```

#### Options
```bash
-l, --layers <layers>     Specify layers to run (default: auto-detect)
-d, --dry-run            Preview changes without applying them
-v, --verbose            Detailed output with analysis and timings
-b, --backup             Create .backup files before modifications
--exclude <patterns>     Exclude patterns (comma-separated globs)
--skip-layers <layers>   Skip specific layers
--force                  Force execution even with validation warnings
--cache                  Enable transformation caching (default: true)
--no-ast                 Disable AST transformations (use regex only)
```

#### Examples
```bash
# Auto-detect optimal layers and apply fixes
neurolint fix --verbose

# Run specific layers only
neurolint fix --layers 1,2,3

# Skip certain layers
neurolint fix --skip-layers 4,5,6

# Dry run with backups
neurolint fix --dry-run --backup

# Exclude node_modules and build directories
neurolint fix --exclude "node_modules/**,dist/**,build/**"
```

### 🔍 Analyze Command
Analyze code and recommend appropriate layers without making changes.

```bash
neurolint analyze [target]

# Examples
neurolint analyze                    # Analyze src/ directory
neurolint analyze src/components/    # Analyze specific directory
neurolint analyze --exclude "**/*.test.ts"  # Exclude test files
```

### ⚙️ Individual Layer Commands
Run specific layers independently.

```bash
neurolint layer-1    # Configuration fixes
neurolint layer-2    # Entity cleanup  
neurolint layer-3    # Component fixes
neurolint layer-4    # Hydration fixes
neurolint layer-5    # Next.js optimizations
neurolint layer-6    # Testing improvements
```

### 📋 Config Command
Manage NeuroLint configuration.

```bash
neurolint config --init    # Create default configuration
neurolint config --show    # Show current configuration
```

### 🧪 Test Command
Run the NeuroLint test suite to verify functionality.

```bash
neurolint test             # Run all tests
neurolint test --verbose   # Detailed test output
```

## 🏗️ Layer System

NeuroLint operates through 6 specialized layers, each targeting specific types of issues:

### Layer 1: Configuration Fixes 🔧
- **TypeScript Configuration**: Updates `tsconfig.json` with modern settings
- **Next.js Configuration**: Cleans up `next.config.js`
- **Package.json**: Optimizes scripts and dependencies

**Example fixes:**
- Upgrade TypeScript target from ES5 to ES2020
- Enable `downlevelIteration` and `esModuleInterop`
- Add security headers to Next.js config

### Layer 2: Entity Cleanup 🧹
- **HTML Entity Corruption**: Fixes `&quot;`, `&#x27;`, `&amp;`
- **Import Cleanup**: Removes unused imports
- **Console Statements**: Converts `console.log` to `console.debug`

**Example fixes:**
```javascript
// Before
const message = &quot;Hello &amp; Welcome&quot;;
console.log(message);

// After  
const message = "Hello & Welcome";
console.debug(message);
```

### Layer 3: Component Fixes ⚛️
- **Missing Key Props**: Adds key props to mapped elements
- **Button Components**: Ensures proper variant props
- **Missing Imports**: Auto-adds missing component imports

**Example fixes:**
```jsx
// Before
{items.map(item => <div>{item.name}</div>)}

// After
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### Layer 4: Hydration Fixes 💧
- **SSR Guards**: Adds `typeof window !== "undefined"` guards
- **LocalStorage Protection**: Guards localStorage access during SSR
- **Theme Provider Hydration**: Fixes hydration mismatches

**Example fixes:**
```javascript
// Before
const value = localStorage.getItem('key');

// After
const value = typeof window !== 'undefined' && localStorage.getItem('key');
```

### Layer 5: Next.js Optimizations ⚡
- **Performance Optimizations**: Image optimization, lazy loading
- **Routing Improvements**: App Router optimizations
- **Middleware Enhancements**: Security and performance middleware

### Layer 6: Testing Improvements 🧪
- **Test Setup**: Configures Jest, React Testing Library
- **Test Utilities**: Creates helper functions and mocks
- **Coverage Configuration**: Sets up code coverage reporting

## 🤖 Auto-Detection

NeuroLint can automatically detect which layers are needed:

```bash
# Auto-detect optimal layers
neurolint fix --layers auto

# Or simply (auto is default)
neurolint fix
```

**Auto-detection analyzes:**
- File types and patterns
- Import statements
- Component structures
- Configuration files
- Error patterns

## ⚙️ Configuration

Create a `.neurolint.json` file for project-specific settings:

```json
{
  "layers": [1, 2, 3, 4],
  "excludePatterns": [
    "node_modules/**",
    "dist/**", 
    "build/**",
    ".git/**"
  ],
  "createBackups": true,
  "useAST": true,
  "useCache": true,
  "verbose": false
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `layers` | `number[]` | `[1,2,3,4]` | Default layers to run |
| `excludePatterns` | `string[]` | See above | File patterns to exclude |
| `createBackups` | `boolean` | `true` | Create backup files |
| `useAST` | `boolean` | `true` | Use AST transformations |
| `useCache` | `boolean` | `true` | Enable transformation caching |
| `verbose` | `boolean` | `false` | Verbose output by default |

## 🛡️ Safety Features

NeuroLint prioritizes safety with multiple layers of protection:

### 🔒 Validation System
- **Syntax Validation**: Ensures transformations don't break syntax
- **Corruption Detection**: Identifies and prevents code corruption
- **Incremental Validation**: Validates each layer independently

### 🔄 Recovery System
- **Automatic Rollback**: Reverts unsafe transformations
- **Error Categorization**: Provides actionable error messages
- **Graceful Degradation**: Continues processing after non-critical errors

### 📋 Dry Run Mode
```bash
neurolint fix --dry-run    # Preview all changes
neurolint analyze          # Analyze without any changes
```

### 💾 Backup System
```bash
neurolint fix --backup     # Create .backup files
```

## 📊 Performance

### Execution Times
- **Layer 1**: ~2-5 seconds (configuration files only)
- **Layer 2**: ~10-30 seconds (depends on codebase size)
- **Layer 3**: ~5-15 seconds (component files only)  
- **Layer 4**: ~5-15 seconds (hydration files only)
- **Total**: Usually completes in under 1 minute

### Optimization Features
- **Smart Layer Selection**: Only runs necessary layers
- **Transformation Caching**: Caches results for performance
- **Parallel Processing**: Optimized for large codebases
- **Change Detection**: Skips files that don't need changes

## 🔧 Troubleshooting

### Common Issues

#### "No files found to process"
```bash
# Check your target path and exclude patterns
neurolint fix src/ --verbose
neurolint fix --exclude ""
```

#### "Layer file not found"
```bash
# Ensure you're running from project root with layer files
ls src/lib/neurolint/layers/
```

#### "Syntax errors after transformation"
```bash
# Run with validation and backup
neurolint fix --backup --verbose
```

### Debug Mode
```bash
# Maximum verbosity for debugging
neurolint fix --verbose --dry-run
```

### Recovery
```bash
# Restore from backups
find . -name "*.backup" -exec bash -c 'mv "$1" "${1%.backup}"' _ {} \;

# Clean temporary files
neurolint clean
```

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/neurolint/cli.git
cd cli
npm install
npm run build
npm link
```

### Running Tests
```bash
npm test
neurolint test --verbose
```

### Adding Custom Layers
1. Create layer file in `src/lib/neurolint/layers/`
2. Follow existing layer patterns
3. Add tests for new functionality
4. Update documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/neurolint/cli/issues)
- **Documentation**: [Full documentation](https://neurolint.dev)
- **Discord**: [Join our community](https://discord.gg/neurolint)

## 🎉 Examples

### Basic Workflow
```bash
# 1. Analyze your codebase
neurolint analyze

# 2. Preview recommended fixes
neurolint fix --dry-run

# 3. Apply fixes with backup
neurolint fix --backup --verbose

# 4. Verify results
npm run build
npm run test
```

### CI/CD Integration
```yaml
# .github/workflows/neurolint.yml
name: NeuroLint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx @neurolint/cli analyze
      - run: npx @neurolint/cli fix --dry-run
```

### Package.json Scripts
```json
{
  "scripts": {
    "fix": "neurolint fix",
    "fix:check": "neurolint fix --dry-run",
    "fix:all": "neurolint fix --verbose --backup",
    "analyze": "neurolint analyze"
  }
}
```

---

**Built with ❤️ by the NeuroLint team**
