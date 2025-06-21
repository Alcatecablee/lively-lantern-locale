import React from 'react'
import { Upload, Zap, Download, Layers } from 'lucide-react'
const steps = [
  {
    icon: Upload,
    title: 'Upload Your Files',
    description: 'Drag and drop your React files (.js, .jsx, .ts, .tsx) and our enhanced parser will prepare them for analysis.',
    step: '01',
    ariaLabel: 'Step 1: Upload your React files for enhanced analysis'
  },
  {
    icon: Layers,
    title: 'Modular Analysis',
    description: 'Our refactored engine runs dedicated detectors across 6 layers with improved reliability and performance.',
    step: '02',
    ariaLabel: 'Step 2: Enhanced modular analysis across 6 layers'
  },
  {
    icon: Download,
    title: 'Enhanced Results',
    description: 'Receive comprehensive insights with intelligent auto-fixes and detailed implementation guidance.',
    step: '03',
    ariaLabel: 'Step 3: Receive enhanced analysis results and intelligent fixes'
  }
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 bg-cursor-bg relative" role="region" aria-labelledby="how-it-works-heading">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cursor-accent-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cursor-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-cursor-text-primary mb-4 sm:mb-6 tracking-tight">
            How Our Enhanced System Works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-cursor-text-secondary max-w-3xl mx-auto font-medium">
            Experience comprehensive code analysis with our completely refactored, enterprise-grade architecture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16" role="list" aria-label="Enhanced process steps">
          {steps.map((step, index) => (
            <div 
              key={index} 
              role="listitem"
              aria-label={step.ariaLabel}
              className="text-center group relative animate-fade-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-cursor-accent-blue hover:bg-cursor-accent-blue/80 rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-all duration-300 shadow-cursor-lg cursor-pointer focus-within:ring-4 focus-within:ring-cursor-accent-blue/50 focus-within:ring-offset-2 focus-within:ring-offset-cursor-bg">
                  <step.icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-cursor-surface border-2 border-cursor-border rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <span className="text-xs sm:text-sm font-black text-cursor-accent-blue" aria-label={`Step ${step.step}`}>
                    {step.step}
                  </span>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-cursor-text-primary mb-4 sm:mb-6">
                {step.title}
              </h3>
              <p className="text-cursor-text-secondary leading-relaxed text-sm sm:text-base lg:text-lg font-medium max-w-sm mx-auto">
                {step.description}
              </p>

              {/* Connection arrows for desktop */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-8 sm:top-10 lg:top-12 left-full transform -translate-x-1/2 w-full pointer-events-none"
                  aria-hidden="true"
                >
                  <div className="flex items-center justify-center">
                    <div className="w-12 lg:w-16 h-1 bg-cursor-accent-blue transition-all duration-300 group-hover:bg-cursor-accent-blue/80"></div>
                    <svg className="w-4 h-4 lg:w-6 lg:h-6 text-cursor-accent-blue ml-2 transition-colors duration-300 group-hover:text-cursor-accent-blue/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Mobile connection indicators */}
              {index < steps.length - 1 && (
                <div 
                  className="md:hidden flex justify-center mt-6"
                  aria-hidden="true"
                >
                  <div className="w-1 h-8 bg-cursor-accent-blue rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Features Callout */}
        <div className="mt-16 card-cursor p-8 text-center relative overflow-hidden group">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cursor-accent-blue/10 to-cursor-accent-purple/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-cursor-text-primary mb-4">Enhanced Architecture</h3>
            <p className="text-cursor-text-secondary mb-6 max-w-2xl mx-auto">
              Our completely refactored system features modular detectors, improved error handling, 
              and enhanced reliability for enterprise-grade code analysis.
            </p>
            <div className="flex justify-center items-center space-x-6 text-sm text-cursor-text-muted">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-yellow-400 mr-2" />
                <span>Modular Detectors</span>
              </div>
              <div className="flex items-center">
                <Layers className="h-4 w-4 text-cursor-accent-blue mr-2" /><span>Enhanced Reliability</span>
              </div>
              <div className="flex items-center"><Download className="h-4 w-4 text-cursor-accent-green mr-2" /><span>Intelligent Fixes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};