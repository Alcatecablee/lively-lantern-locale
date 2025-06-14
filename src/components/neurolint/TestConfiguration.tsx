
'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Brain } from 'lucide-react';

interface TestConfigurationProps {
  useAST: boolean;
  setUseAST: (value: boolean) => void;
  enableConflictDetection: boolean;
  setEnableConflictDetection: (value: boolean) => void;
  enableSemanticAnalysis: boolean;
  setEnableSemanticAnalysis: (value: boolean) => void;
}

export function TestConfiguration({
  useAST,
  setUseAST,
  enableConflictDetection,
  setEnableConflictDetection,
  enableSemanticAnalysis,
  setEnableSemanticAnalysis
}: TestConfigurationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center space-x-2">
        <Switch
          id="ast-mode"
          checked={useAST}
          onCheckedChange={setUseAST}
        />
        <Label htmlFor="ast-mode" className="text-sm">
          AST-based transforms
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
