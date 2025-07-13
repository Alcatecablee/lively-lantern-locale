
// ErrorRecoverySystem - Categorized error handling and suggestions
class ErrorRecoverySystem {
  static errorCategories = {
    SYNTAX_ERROR: 'syntax',
    FILESYSTEM_ERROR: 'filesystem',
    DEPENDENCY_ERROR: 'dependency',
    TRANSFORMATION_ERROR: 'transformation',
    VALIDATION_ERROR: 'validation'
  };

  static categorizeError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('syntax') || message.includes('unexpected token')) {
      return this.errorCategories.SYNTAX_ERROR;
    }

    if (message.includes('enoent') || message.includes('file not found')) {
      return this.errorCategories.FILESYSTEM_ERROR;
    }

    if (message.includes('module not found') || message.includes('cannot resolve')) {
      return this.errorCategories.DEPENDENCY_ERROR;
    }

    if (message.includes('transform') || message.includes('parse')) {
      return this.errorCategories.TRANSFORMATION_ERROR;
    }

    return this.errorCategories.VALIDATION_ERROR;
  }

  static getSuggestions(errorCategory, error) {
    const suggestions = {
      [this.errorCategories.SYNTAX_ERROR]: [
        'Check for missing semicolons or brackets',
        'Validate JSX syntax and closing tags',
        'Run with --verbose for detailed syntax information'
      ],
      [this.errorCategories.FILESYSTEM_ERROR]: [
        'Verify file path exists',
        'Check file permissions',
        'Ensure working directory is correct'
      ],
      [this.errorCategories.DEPENDENCY_ERROR]: [
        'Run npm install to install missing dependencies',
        'Check import paths and module names',
        'Verify package.json dependencies'
      ],
      [this.errorCategories.TRANSFORMATION_ERROR]: [
        'Try running individual layers to isolate the issue',
        'Use --skip-layers to bypass problematic transformations',
        'Check input file format compatibility'
      ],
      [this.errorCategories.VALIDATION_ERROR]: [
        'Review transformation output for corruption',
        'Use --dry-run to preview changes',
        'Check for circular dependencies'
      ]
    };

    return suggestions[errorCategory] || ['Contact support with error details'];
  }

  static handleError(error, context = {}) {
    const category = this.categorizeError(error);
    const suggestions = this.getSuggestions(category, error);

    return {
      category,
      message: error.message,
      suggestions,
      context,
      recoverable: category !== this.errorCategories.SYNTAX_ERROR
    };
  }
}

module.exports = ErrorRecoverySystem;
