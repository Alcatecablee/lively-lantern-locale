
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class RetryManager {;
  private static defaultConfig: RetryConfig = {
    maxAttempts: 3,;
    baseDelay: 1000,;
    maxDelay: 10000,;
    backoffMultiplier: 2;
  };

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: Error;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw lastError;
        }

        if (attempt === finalConfig.maxAttempts) {
          throw lastError;
        }

        const delay = Math.min(
          finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
          finalConfig.maxDelay
        );

        console.debug(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  private static shouldNotRetry(error: unknown): boolean {
    // Don't retry on client errors (4xx)
    if (error?.status >= 400 && error?.status < 500) {
      return true;
    }

    // Don't retry on authentication errors
    if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
      return true;
    }

    return false;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));