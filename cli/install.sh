#!/bin/bash

echo "🧠 NeuroLint CLI Installation Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION="16.0.0"

if ! node -e "process.exit(process.version.slice(1).split('.').reduce((a,b,i)=>(a||0)+b*Math.pow(1000,2-i),0) < '$REQUIRED_VERSION'.split('.').reduce((a,b,i)=>(a||0)+b*Math.pow(1000,2-i),0))"; then
    echo "❌ Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Make the CLI executable
echo "🔧 Making CLI executable..."
chmod +x bin/neurolint.js

# Create symlink for global usage (optional)
echo "🔗 Creating global link..."
npm link

if [ $? -eq 0 ]; then
    echo "✅ NeuroLint CLI installed globally!"
    echo ""
    echo "🎉 Installation Complete!"
    echo ""
    echo "Usage:"
    echo "  neurolint fix                 # Fix your codebase"
    echo "  neurolint analyze             # Analyze code issues"
    echo "  neurolint fix --dry-run       # Preview changes"
    echo "  neurolint fix --verbose       # Detailed output"
    echo ""
    echo "Run 'neurolint --help' for all available commands."
else
    echo "⚠️  Global installation failed, but local installation is ready"
    echo "Use: node bin/neurolint.js [command]"
fi

# Test the installation
echo ""
echo "🧪 Testing installation..."
if command -v neurolint &> /dev/null; then
    neurolint --version
    echo "✅ NeuroLint CLI is ready to use!"
else
    echo "⚠️  Global command not available, using local path"
    node bin/neurolint.js --version
fi

echo ""
echo "📚 Next steps:"
echo "1. Navigate to your React/Next.js project"
echo "2. Run: neurolint analyze"
echo "3. Run: neurolint fix --dry-run"
echo "4. Run: neurolint fix"
echo ""
echo "Happy coding! 🚀"