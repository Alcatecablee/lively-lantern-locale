import React from 'react';
import { Zap, Upload, Download, Settings, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  onStartAnalysis: () => void;
  onShowSettings: () => void;
  onTestEducational?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onStartAnalysis,
  onShowSettings,
  onTestEducational
}) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="default"
          onClick={onStartAnalysis}
          className="w-full justify-start"
        >
          <Upload className="h-4 w-4 mr-2" />
          Start New Analysis
        </Button>

        {onTestEducational && (
          <Button
            onClick={onTestEducational}
            variant="outline"
            className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
            Test Educational System
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => navigate('/team')}
          className="w-full justify-start"
        >
          <Users className="h-4 w-4 mr-2" />
          Team Dashboard
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Previous Fixes
        </Button>

        <Button
          onClick={onShowSettings}
          variant="outline"
          className="w-full justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </CardContent>
    </Card>
  );
};