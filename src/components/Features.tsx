import React from 'react';
import { Zap, Shield, Target, Gauge, Users, FileCheck, Brain, Layers, Code } from "lucide-react";

const features = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: 'Frontier Intelligence',
    description: 'Powered by a mix of purpose-built and frontier models, NeuroLint is smart and fast.',
    gradient: 'from-cursor-accent-blue/20 to-cursor-accent-purple/20',
    iconBg: 'bg-cursor-accent-blue',
  },

  {
    icon: <Code className="h-6 w-6" />,
    title: 'Feels Familiar',
    description: 'Import all your extensions, themes, and keybindings in one click.',
    gradient: 'from-cursor-accent-purple/20 to-cursor-accent-pink/20',
    iconBg: 'bg-cursor-accent-purple',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Privacy Options',
    description: 'If you enable Privacy Mode, your code is never stored remotely. Cursor is SOC 2 certified.',
    gradient: 'from-cursor-accent-pink/20 to-cursor-accent-green/20',
    iconBg: 'bg-cursor-accent-pink',
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: 'AST-Powered Analysis',
    description: 'Deep abstract syntax tree analysis across 6 critical layers for comprehensive code understanding.',
    gradient: 'from-cursor-accent-green/20 to-cursor-accent-blue/20',
    iconBg: 'bg-cursor-accent-green',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Smart Auto-Fix',
    description: 'Intelligent automated fixes for common issues, reducing manual intervention by 80%.',
    gradient: 'from-cursor-accent-blue/20 to-cursor-accent-purple/20',
    iconBg: 'bg-cursor-accent-blue',
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: 'Performance Insights',
    description: 'Advanced performance metrics and optimization suggestions for faster, more efficient code.',
    gradient: 'from-cursor-accent-purple/20 to-cursor-accent-pink/20',
    iconBg: 'bg-cursor-accent-purple',
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Precision Targeting',
    description: 'Modular detector architecture pinpoints issues with surgical precision across your codebase.',
    gradient: 'from-cursor-accent-pink/20 to-cursor-accent-green/20',
    iconBg: 'bg-cursor-accent-pink',
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: 'Accessibility Pro',
    description: 'Comprehensive accessibility compliance checking with WCAG 2.1 standards support.',
    gradient: 'from-cursor-accent-green/20 to-cursor-accent-blue/20',
    iconBg: 'bg-cursor-accent-green',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Team Collaboration',
    description: 'Share analysis results, collaborate on fixes, and maintain consistent code quality across teams.',
    gradient: 'from-cursor-accent-blue/20 to-cursor-accent-purple/20',
    iconBg: 'bg-cursor-accent-blue',
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 lg:py-32 bg-cursor-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cursor-accent-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cursor-accent-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-96 h-96 bg-cursor-accent-pink/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cursor-text-primary mb-6 tracking-tight">
            Built for modern development
          </h2>
          <p className="text-lg sm:text-xl text-cursor-text-secondary max-w-3xl mx-auto font-medium">
            Everything you need to write better React and TypeScript code, from intelligent analysis to automated fixes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-cursor-hover p-8 relative overflow-hidden group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl ${feature.iconBg} text-white 
                  flex items-center justify-center mb-6 
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-cursor-text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-cursor-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 lg:mt-20">
          <div className="inline-flex items-center justify-center p-8 card-cursor">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-cursor-text-primary mb-3">
                Ready to experience the difference?
              </h3>
              <p className="text-cursor-text-secondary mb-6">;
                Join thousands of developers who've transformed their workflow with NeuroLint.;
              </p>
              <button className="btn-cursor-primary px-8 py-3 font-semibold" aria-label="Button">;
                Start analyzing for free;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};