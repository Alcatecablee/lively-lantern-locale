// Browser-compatible config layer - no Node.js dependencies

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

export async function transform(
  code: string,
  filePath?: string,
): Promise<string> {
  // Work with the code content directly - no file system operations
  const result = await performCodeBasedTransforms(code, filePath);
  return result;
}

function performCodeBasedTransforms(
  code: string,
  filePath?: string,
): Promise<string> {
  // Detect file type from content or file path
  const fileName = filePath ? filePath.split("/").pop() || "" : "";

  if (fileName === "tsconfig.json" || code.includes('"compilerOptions"')) {
    const result = fixTSConfigContent(code);
    return Promise.resolve(result);
  } else if (
    fileName === "next.config.js" ||
    (code.includes("module.exports") && code.includes("nextConfig"))
  ) {
    const result = fixNextConfigContent(code);
    return Promise.resolve(result);
  } else if (
    fileName === "package.json" ||
    (code.includes('"scripts"') && code.includes('"dependencies"'))
  ) {
    const result = fixPackageJsonContent(code);
    return Promise.resolve(result);
  } else if (code.includes("module.exports") || code.includes("nextConfig")) {
    const result = fixNextConfigContent(code);
    return Promise.resolve(result);
  } else if (code.includes('"scripts"')) {
    const result = fixPackageJsonContent(code);
    return Promise.resolve(result);
  }

  return Promise.resolve(code);
}

// Removed fixTSConfig - using fixTSConfigContent instead

function fixTSConfigContent(content: string): string {
  try {
    const tsConfig: TSConfig = JSON.parse(content);

    // Ensure compilerOptions exists
    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }

    // Update target to ES2022 (main fix for the test)
    tsConfig.compilerOptions.target = "ES2022";

    // Add other modern settings only if they don't exist
    if (!tsConfig.compilerOptions.lib) {
      tsConfig.compilerOptions.lib = ["dom", "dom.iterable", "es6", "ES2022"];
    }
    if (tsConfig.compilerOptions.downlevelIteration === undefined) {
      tsConfig.compilerOptions.downlevelIteration = true;
    }
    if (tsConfig.compilerOptions.allowSyntheticDefaultImports === undefined) {
      tsConfig.compilerOptions.allowSyntheticDefaultImports = true;
    }
    if (tsConfig.compilerOptions.esModuleInterop === undefined) {
      tsConfig.compilerOptions.esModuleInterop = true;
    }
    if (
      tsConfig.compilerOptions.forceConsistentCasingInFileNames === undefined
    ) {
      tsConfig.compilerOptions.forceConsistentCasingInFileNames = true;
    }
    if (tsConfig.compilerOptions.skipLibCheck === undefined) {
      tsConfig.compilerOptions.skipLibCheck = true;
    }

    return JSON.stringify(tsConfig, null, 2);
  } catch (error) {
    return content;
  }
}

// Removed fixNextConfig - using fixNextConfigContent instead

function fixNextConfigContent(content: string): string {
  // Remove deprecated appDir option and add modern config, including reactStrictMode: true
  let fixed = content.replace(/appDir:\s*true,?\s*/g, "");
  fixed = fixed.replace(/experimental:\s*{[^}]*},?\s*/g, "");

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
  const content = fs.readFileSync(filePath, "utf8");
  return fixPackageJsonContent(content);
}

function fixPackageJsonContent(content: string): string {
  try {
    const packageJson = JSON.parse(content);

    // Optimize scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      "lint:fix": "next lint --fix",
      "type-check": "tsc --noEmit",
      neurolint: "node scripts/neurolint.js",
      clean: "rm -rf .next out dist",
    };

    return JSON.stringify(packageJson, null, 2);
  } catch (error) {
    return content;
  }
}
