import * as fs from 'fs';
import * as path from 'path';

interface TSConfig {
  compilerOptions?: Record<string, any>;
  include?: string[];
  exclude?: string[];
}

interface NextConfig {
  experimental?: Record<string, any>;
  typescript?: Record<string, any>;
  eslint?: Record<string, any>;
  [key: string]: any;
}

export async function transform(code: string, filePath?: string): Promise<string> {
  // If we have a file path, we can do actual file operations
  if (filePath) {
    return await performFileBasedTransforms(filePath);
  }
  
  // Otherwise, work with the code content directly
  return performCodeBasedTransforms(code);
}

async function performFileBasedTransforms(filePath: string): Promise<string> {
  const fileName = path.basename(filePath);
  
  if (fileName === 'tsconfig.json') {
    return fixTSConfig(filePath);
  } else if (fileName === 'next.config.js') {
    return fixNextConfig(filePath);
  } else if (fileName === 'package.json') {
    return fixPackageJson(filePath);
  }
  
  return fs.readFileSync(filePath, 'utf8');
}

function performCodeBasedTransforms(code: string): Promise<string> {
  // For demo purposes, detect file type from content
  if (code.includes('"compilerOptions"') || code.includes('compilerOptions')) {
    return Promise.resolve(fixTSConfigContent(code));
  } else if (code.includes('nextConfig') || code.includes('module.exports')) {
    return Promise.resolve(fixNextConfigContent(code));
  } else if (
    code.includes('"scripts"')
  ) {
    return Promise.resolve(fixPackageJsonContent(code));
  }
  
  return Promise.resolve(code);
}

function fixTSConfig(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8');
  const tsConfig: TSConfig = JSON.parse(content);

  // Update compiler options with modern settings
  tsConfig.compilerOptions = {
    ...tsConfig.compilerOptions,
    target: "ES2022", // Updated from ES2020 to ES2022
    lib: ["dom", "dom.iterable", "es6", "ES2022"],
    downlevelIteration: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    strict: true,
    noEmit: true,
    incremental: true,
    skipLibCheck: true,
    isolatedModules: true,
    jsx: "preserve",
    baseUrl: ".",
    paths: {
      "@/*": ["./src/*"]
    }
  };

  return JSON.stringify(tsConfig, null, 2);
}

function fixTSConfigContent(content: string): string {
  try {
    const tsConfig: TSConfig = JSON.parse(content);

    tsConfig.compilerOptions = {
      ...tsConfig.compilerOptions,
      target: "ES2022", // Updated from ES2020 to ES2022
      lib: ["dom", "dom.iterable", "es6", "ES2022"],
      downlevelIteration: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
      isolatedModules: true,
      jsx: "preserve",
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    };

    return JSON.stringify(tsConfig, null, 2);
  } catch (error) {
    return content;
  }
}

function fixNextConfig(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8');
  return fixNextConfigContent(content);
}

function fixNextConfigContent(content: string): string {
  // Remove deprecated appDir option and add modern config, including reactStrictMode: true
  let fixed = content.replace(/appDir:\s*true,?\s*/g, '');
  fixed = fixed.replace(/experimental:\s*{[^}]*},?\s*/g, '');
  
  // Add optimized Next.js configuration, including reactStrictMode: true
  const optimizedConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`;
  
  return optimizedConfig;
}

function fixPackageJson(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8');
  return fixPackageJsonContent(content);
}

function fixPackageJsonContent(content: string): string {
  try {
    const packageJson = JSON.parse(content);
    
    // Optimize scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "lint:fix": "next lint --fix",
      "type-check": "tsc --noEmit",
      "neurolint": "node scripts/neurolint.js",
      "clean": "rm -rf .next out dist"
    };
    
    return JSON.stringify(packageJson, null, 2);
  } catch (error) {
    return content;
  }
}
