
'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Brain, Zap } from 'lucide-react';

interface TestConfigurationProps {
  enableConflictDetection: boolean;
  setEnableConflictDetection: (value: boolean) => void;
  enableSemanticAnalysis: boolean;
  setEnableSemanticAnalysis: (value: boolean) => void;
}

export function TestConfiguration({
  enableConflictDetection,
  setEnableConflictDetection,
  enableSemanticAnalysis,
  setEnableSemanticAnalysis
}: TestConfigurationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center space-x-2">
        <Zap className="w-4 h-4 text-purple-500" />
        <Label className="text-sm font-medium">
          AST Transformations (Always Active)
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="conflict-detection"
          checked={enableConflictDetection}
          onCheckedChange={setEnableConflictDetection}
        />
        <Label htmlFor="conflict-detection" className="text-sm flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Conflict Detection
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="semantic-analysis"
          checked={enableSemanticAnalysis}
          onCheckedChange={setEnableSemanticAnalysis}
        />
        <Label htmlFor="semantic-analysis" className="text-sm flex items-center gap-1">
          <Brain className="w-3 h-3" />
          Semantic Analysis
        </Label>
      </div>
    </div>
  );
}
