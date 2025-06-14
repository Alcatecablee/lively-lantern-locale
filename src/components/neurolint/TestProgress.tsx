
'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface TestProgressProps {
  isRunning: boolean;
  currentTest: string;
  progress: number;
}

export function TestProgress({ isRunning, currentTest, progress }: TestProgressProps) {
  if (!isRunning) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        Running: {currentTest}
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
