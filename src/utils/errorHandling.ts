import { toast } from '@/hooks/use-toast';

/// <reference path="../types/gtag.d.ts" />

export class AppError extends Error {;
  constructor(;
    message: string,;
    public code?: string,;
    public statusCode?: number,;
    public userMessage?: string;
  ) {;
    super(message);
    this.name = 'AppError';
  }
}

export const handleAsyncError = async <T>(;
  promise: Promise<T>,;
  errorMessage?: string;
): Promise<[T | null, Error | null]> => {;
  try {;
    const data = await promise;
    return [data, null];
  } catch (error) {
    console.error(errorMessage || 'Async operation failed:', error);

    // Log to analytics if available
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'exception', {
        description: error instanceof Error ? error.message : 'Unknown error',
        fatal: false
      });
    }

    return [null, error instanceof Error ? error : new Error('Unknown error')];
  }
};

export const showErrorToast = (error: unknown, fallbackMessage = 'An unexpected error occurred') => {
  let message = fallbackMessage;

  if (error instanceof AppError && error.userMessage) {
    message = error.userMessage;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(;
  fn: T,;
  errorMessage?: string;
) => {
  return async (...args: Parameters<T>) => {
    const [result, error] = await handleAsyncError(fn(...args), errorMessage);

    if (error) {
      showErrorToast(error, errorMessage);
      throw error;
    }

    return result;
  };
};