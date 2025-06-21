import React from 'react';
import { CheckCircle, Clock, AlertCircle, Users, Code, Shield, Zap } from 'lucide-react';

interface FeatureStatus {
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  eta?: string;
  icon: React.ReactNode;
}

const features: FeatureStatus[] = [
  {
    name: 'Code Analysis Engine',
    description: 'Core React/TypeScript analysis with 6-layer detection',
    status: 'completed',
    plan: 'free',
    icon: <Code className="h-5 w-5" />
  },
  {
    name: 'User Authentication',
    description: 'Secure signup, login, and profile management',
    status: 'completed',
    plan: 'free',
    icon: <Shield className="h-5 w-5" />
  },
  {
    name: 'Usage Limits Enforcement',
    description: 'Track and enforce 5 analysis/month limit for free users',
    status: 'in-progress',
    plan: 'free',
    eta: 'Week 1',
    icon: <AlertCircle className="h-5 w-5" />
  },
  {
    name: 'Unlimited Analysis',
    description: 'Remove analysis limits for Pro subscribers',
    status: 'in-progress',
    plan: 'pro',
    eta: 'Week 1',
    icon: <Zap className="h-5 w-5" />
  },
  {
    name: 'Advanced Auto-Fix',
    description: 'Intelligent code fixes and optimization suggestions',
    status: 'in-progress',
    plan: 'pro',
    eta: 'Week 2-3',
    icon: <Code className="h-5 w-5" />
  },
  {
    name: 'Team Management',
    description: 'Create teams, invite members, assign roles',
    status: 'planned',
    plan: 'team',
    eta: 'Week 3-4',
    icon: <Users className="h-5 w-5" />
  },
  {
    name: 'Team Collaboration',
    description: 'Shared analysis history and collaborative features',
    status: 'planned',
    plan: 'team',
    eta: 'Week 4-5',
    icon: <Users className="h-5 w-5" />
  },
  {
    name: 'Custom Rules Engine',
    description: 'Create and manage custom linting rules',
    status: 'planned',
    plan: 'enterprise',
    eta: 'Week 8-12',
    icon: <Code className="h-5 w-5" />
  },
  {
    name: 'REST API Access',
    description: 'Programmatic access to analysis features',
    status: 'planned',
    plan: 'enterprise',
    eta: 'Week 6-8',
    icon: <Code className="h-5 w-5" />
  },
  {
    name: 'SSO Integration',
    description: 'SAML and OIDC single sign-on support',
    status: 'planned',
    plan: 'enterprise',
    eta: 'Week 16-20',
    icon: <Shield className="h-5 w-5" />
  }
];

const getStatusIcon = (status: FeatureStatus['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-cursor-accent-green" />;
    case 'in-progress':
      return <Clock className="h-4 w-4 text-cursor-accent-blue" />;
    case 'planned':
      return <AlertCircle className="h-4 w-4 text-cursor-text-muted" />;
  }
};

const getStatusText = (status: FeatureStatus['status']) => {
  switch (status) {
    case 'completed':
      return 'Available Now';
    case 'in-progress':
      return 'In Development';
    case 'planned':
      return 'Coming Soon';
  }
};

const getStatusColor = (status: FeatureStatus['status']) => {
  switch (status) {
    case 'completed':
      return 'text-cursor-accent-green';
    case 'in-progress':
      return 'text-cursor-accent-blue';
    case 'planned':
      return 'text-cursor-text-muted';
  }
};

const getPlanColor = (plan: FeatureStatus['plan']) => {
  switch (plan) {
    case 'free':
      return 'bg-cursor-accent-green/20 text-cursor-accent-green border-cursor-accent-green/30';
    case 'pro':
      return 'bg-cursor-accent-blue/20 text-cursor-accent-blue border-cursor-accent-blue/30';
    case 'team':
      return 'bg-cursor-accent-purple/20 text-cursor-accent-purple border-cursor-accent-purple/30';
    case 'enterprise':
      return 'bg-cursor-accent-pink/20 text-cursor-accent-pink border-cursor-accent-pink/30';
  }
};

export const DevelopmentStatus: React.FC = () => {
  const completedFeatures = features.filter(f => f.status === 'completed').length;
  const totalFeatures = features.length;
  const progressPercentage = (completedFeatures / totalFeatures) * 100;

  return (
    <div className="card-cursor p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-cursor-text-primary">Development Progress</h3>
          <span className="text-sm text-cursor-text-secondary font-medium">
            {completedFeatures} of {totalFeatures} features complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-cursor-surface rounded-full h-3 border border-cursor-border">
            <div 
              className="bg-gradient-cursor-blue h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="text-right mt-2">
            <span className="text-sm font-semibold text-cursor-text-primary">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-start space-x-4 p-4 bg-cursor-surface border border-cursor-border rounded-lg hover:bg-cursor-card transition-colors duration-200"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-cursor-card border border-cursor-border flex items-center justify-center text-cursor-text-secondary">
                {feature.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-cursor-text-primary">
                    {feature.name}
                  </h4>
                  <p className="text-sm text-cursor-text-secondary mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPlanColor(feature.plan)}`}>
                    {feature.plan.charAt(0).toUpperCase() + feature.plan.slice(1)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(feature.status)}
                    <span className={`text-xs font-medium ${getStatusColor(feature.status)}`}>
                      {getStatusText(feature.status)}
                      {feature.eta && ` (${feature.eta})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notice */}
      <div className="mt-8 p-6 bg-cursor-accent-blue/10 border border-cursor-accent-blue/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-cursor-accent-blue flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-base font-semibold text-cursor-accent-blue mb-2">Development Notice</h4>
            <p className="text-sm text-cursor-text-secondary leading-relaxed">
              Paid plan features are currently under active development. We've temporarily disabled 
              payment collection until these features are fully implemented. Free users can enjoy 
              the core analysis features while we build out the premium capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 text-center">
        <p className="text-sm text-cursor-text-secondary">
          Want to be notified when paid features are ready?{' '}
          <button className="text-cursor-accent-blue hover:text-cursor-accent-purple font-medium transition-colors duration-200" aria-label="Button">
            Join our waitlist
          </button>
        </p>
      </div>
    </div>
  );
}; 
          </AlertCircle>
      </AlertCircle>
      </Clock>
      </CheckCircle>
    </Shield>
    </Code>
    </Code>
    </Users>
    </Users>
    </Code>
    </Zap>
    </AlertCircle>
    </Shield>
    </Code>
}