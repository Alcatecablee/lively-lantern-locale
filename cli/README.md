# NeuroLint CLI

A command-line interface for the NeuroLint automated code fixing system.

## Installation

### Option 1: Direct Installation
```bash
npm install -g @neurolint/cli
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
neurolint fix --layers 1,2,3,4,5,6

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
- `-l, --layers <layers>` - Comma-separated list of layers (1,2,3,4,5,6)
- `-d, --dry-run` - Preview changes without applying them
- `-v, --verbose` - Show detailed output
- `-b, --backup` - Create backup files before fixing
- `--exclude <patterns>` - Exclude file patterns

**Examples:**
```bash
neurolint fix src/                          # Fix entire src directory
neurolint fix MyComponent.tsx               # Fix single file
neurolint fix --layers 1,2 --dry-run       # Preview config & pattern fixes
neurolint fix --exclude "*.test.js,*.spec.js" # Exclude test files
```

### `neurolint test`
Run the built-in test suite to verify the fixing logic.

**Options:**
- `-v, --verbose` - Show detailed test output and transformation results

### `neurolint init`
Initialize NeuroLint configuration in the current project.

Creates a `neurolint.config.json` file with default settings.

## Layers

1. **Configuration Validation**
   - Updates TypeScript compiler options
   - Optimizes Next.js configuration
   - Enhances package.json scripts
   - Risk-aware transformations with JSON validation

2. **Pattern & Entity Fixes**
   - Fixes HTML entities
   - Modernizes JavaScript patterns
   - Converts generator functions to async/await
   - Optimizes React patterns (Fragment shorthand, className)
   - Import deduplication and cleanup

3. **Component Best Practices**
   - Adds missing key props with index
   - Manages React imports automatically
   - Implements accessibility attributes
   - Adds TypeScript prop types and interfaces
   - Validates transformations for safety

4. **Hydration & SSR Guards**
   - Adds SSR guards for browser APIs
   - Prevents hydration mismatches
   - Smart detection of client components
   - Syntax validation for each transformation

5. **Next.js Optimizations**
   - Next.js specific optimizations
   - Server/client component handling
   - Framework-specific best practices

6. **Testing Improvements**
   - Enhances test coverage
   - Adds error boundaries where needed
   - Validates component transformations
   - Prevents breaking changes

## Configuration File

Create `neurolint.config.json` in your project root:

```json
{
  "layers": [1, 2, 3, 4, 5, 6],
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
- Check verbose output for transformation details

## Support

- Report issues on GitHub
- Check the test suite with `neurolint test`
- Use `--verbose` for debugging output
- Review transformation logs for detailed insights
