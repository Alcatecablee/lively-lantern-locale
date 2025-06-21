import React from 'react';
import { Lightbulb, Zap, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ProTips: React.FC = () => {
  const tips = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      title: "Optimize Performance",
      description: "Use React.memo for components that re-render frequently with the same props.",
      category: "Performance"
    },
    {
      icon: <Target className="h-5 w-5 text-green-400" />,
      title: "Better Type Safety",
      description: "Define strict TypeScript interfaces for all component props and API responses.",
      category: "TypeScript"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
      title: "Code Organization",
      description: "Keep components under 200 lines and extract custom hooks for complex logic.",
      category: "Best Practices"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-purple-400" />,
      title: "Modern Patterns",
      description: "Use function components with hooks instead of class components for better performance.",
      category: "React"
    }
  ];

  return (
    <Card className="bg-card border-border mt-8">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
          Pro Tips for Better React Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 bg-muted rounded-lg border border-border"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-card-foreground">{tip.title}</h4>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      {tip.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};