#!/usr/bin/env node

/**
 * Fix Layer Validator
 * Prevents fix layers from corrupting the codebase
 */

import fs from 'fs';
import { execSync } from 'child_process';

function validateBeforeAfter(beforeState, afterState) {
  const issues = [];
  
  // Check if build still works
  try {
    execSync('npm run build', { stdio: 'pipe' });
  } catch (error) {
    issues.push('Build broken after fix layer');
  }
  
  // Check for new corruption patterns
  if (afterState.includes("'use client'") && !beforeState.includes("'use client'")) {
    issues.push('Added Next.js patterns to Vite project');
  }
  
  if (afterState.includes('import { import {')) {
    issues.push('Created duplicate import statements');
  }
  
  return issues;
}

export { validateBeforeAfter };
