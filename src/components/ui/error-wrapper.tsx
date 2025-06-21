import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

interface ErrorWrapperProps {
  children: React.ReactNode;
  name?: string;
}

export const UIErrorWrapper: React.FC<ErrorWrapperProps> = ({ children, name }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">
            Failed to load {name || 'component'}
          </h2>
          <p className="mt-2 text-sm text-red-600">
            Please try refreshing the page. If the problem persists, contact support.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}; 