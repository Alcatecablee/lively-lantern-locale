
# NeuroLint: Comprehensive Automated Fixing System

This directory contains a multi-layer automated fixing system designed to detect and resolve common issues in React/Next.js codebases.

---

## 🚀 Quick Start

```bash
# Run all fixes automatically
npm run fix all

# Preview what would be fixed (dry run)
npm run fix dry run

# Run with detailed output
npm run fix verbose

# Run individual layers
npm run fix layer 1  # Configuration fixes
npm run fix layer 2  # Pattern fixes
npm run fix layer 3  # Component fixes
npm run fix layer 4  # Hydration fixes
```

---

## 🔧 System Architecture

### Layer 1: Configuration Fixes

- Updates `tsconfig.json` with modern settings
- Cleans up `next.config.js`; removes deprecated options
- Optimizes `package.json` scripts & dependencies

### Layer 2: Bulk Pattern Fixes

- Fixes HTML entities (`&quot;`, `&#x27;`, `&amp;`)
- Removes unused imports
- Standardizes React component patterns
- Fixes common TypeScript issues
- Upgrades `console.log` usages

### Layer 3: Component Specific Fixes

- Ensures key props for mapped elements
- Standardizes Button/form/icon components
- Improves prop type definitions
- Adds missing imports automatically

### Layer 4: Hydration and SSR Fixes

- Adds SSR guards (`typeof window !== "undefined"`)
- Hydration fixes for theme providers/localStorage usage
- Creates missing files (manifest, robots.txt etc)
- Detects and wraps client-only components

---

## 🔍 Problem Detection

- Categorizes issues: **🔴 Critical** / **🟠 High** / **🟡 Medium** / **🟢 Low**

---

## 📊 Usage Examples

```bash
# Complete run
npm run fix all

# Preview changes
npm run fix dry run

# Skip layers
node scripts/fix master.js   skip layers 1,2

# Verbose output
npm run fix verbose

# Individual layer execution
npm run fix layer 1
```

---

## 🛡️ Safety Features

- Dry run mode, file backups
- Incremental/layered execution
- Final build validation
- Error recovery (skip on failure)

---

## 🎯 Common Fix Patterns

**HTML Entities**
```js
// Before
const message = &quot;Hello World&quot;;
// After
const message = "Hello World";
```

**Missing Key Props**
```jsx
// Before
{items.map(item => <div>{item.name}</div>)}
// After
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

**Button Variants**
```jsx
// Before
<Button>Click me</Button>
// After
<Button variant="default">Click me</Button>
```

**TS Configuration**
```json
// Before
{ "compilerOptions": { "target": "es5" } }
// After
{ "compilerOptions": { "target": "ES2020", "downlevelIteration": true } }
```

**SSR Guards**
```js
// Before
const savedTheme = localStorage.getItem('theme');
// After
const savedTheme = typeof window !== 'undefined' && localStorage.getItem('theme');
```

---

## 📈 Performance Impact

- Each layer runs in seconds (total: under 1 minute in most codebases)

---

## 🔧 Customization

Extend any layer by editing pattern arrays, e.g.:
```js
const patterns = [
  {
    name: 'Custom Fix',
    pattern: /your pattern/g,
    replacement: 'your replacement',
    fileTypes: ['ts', 'tsx']
  }
];
```

### Skipping Fixes

```bash
node scripts/fix master.js   skip layers 2,3
```

---

## 🚨 Troubleshooting

**1. "glob not found"** – auto-installs dependencies  
**2. "Permission denied"** – check write permissions  
**3. "Build failed"** – try with `verbose`/`dry run`, check error output

### Recovery
- Use git to revert
- Run layers individually to isolate
- Use dry run before applying changes

---

## 📝 Logging

- **📝 Info** / **✅ Success** / **⚠️ Warning** / **❌ Error** / **🔍 Debug** (with verbose)

---

## 🤝 Contributing

1. Identify the appropriate layer (config, pattern, component, hydration)
2. Add logic/fixes to relevant script
3. Test with dry run/backups
4. Update docs & submit PR

---

## 📄 License

Part of the Taxfy project, MIT License.
