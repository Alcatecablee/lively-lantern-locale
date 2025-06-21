import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, FileCheck, Clock, Star } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Developers using NeuroLint",
    description: "Trusted by developers worldwide"
  },
  {
    icon: FileCheck,
    value: "250,000+",
    label: "Files analyzed",
    description: "Code quality improved daily"
  },
  {
    icon: Clock,
    value: "500+",
    label: "Hours saved",
    description: "Development time optimized"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Developer satisfaction",
    description: "Based on user feedback"
  }
];

const badges = [
  {
    text: "Featured on Product Hunt",
    variant: "default" as const,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
  },
  {
    text: "YC Startup",
    variant: "secondary" as const,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  },
  {
    text: "SOC 2 Compliant",
    variant: "outline" as const,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  },
  {
    text: "99.9% Uptime",
    variant: "outline" as const,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }
];

export const SocialProof: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const finalValue = parseInt(stat.value.replace(/[^0-9.]/g, ''));
      let currentValue = 0;
      const increment = finalValue / 50; // Animate over 50 steps;

      return setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          currentValue = finalValue;
          clearInterval(timers[index]);
        }

        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = currentValue;
          return newValues;
        });
      }, 30);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  const formatValue = (value: number, originalValue: string) => {
    if (originalValue.includes('+')) {
      return `${Math.floor(value).toLocaleString()}+`;
    }
    if (originalValue.includes('/')) {
      return `${(value / 1000).toFixed(1)}/5`;
    }
    return Math.floor(value).toLocaleString();
  };

  return (
    <section className="py-16 px-4 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Trust Badges */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground mb-6">Trusted by developers at</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant={badge.variant}
                className={`px-4 py-2 text-sm ${badge.color}`}
              >
                {badge.text}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {formatValue(animatedValues[index], stat.value)}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Count Ticker */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {Math.floor(animatedValues[0] / 100)}
              </span> developers analyzed code in the last 24 hours
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};