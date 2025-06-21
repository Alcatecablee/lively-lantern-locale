import { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { ApiExplorer } from './ApiExplorer';
import { LiveDemo } from './LiveDemo';

type DemoView = 'editor' | 'api' | 'live';

export const DemoPage: React.FC = () => {
  const [activeView, setActiveView] = useState<DemoView>('live');

  const views = [
    { id: 'live' as DemoView, name: 'Live Demo', description: 'Interactive analysis experience' },
    { id: 'editor' as DemoView, name: 'Code Editor', description: 'Real-time code analysis' },
    { id: 'api' as DemoView, name: 'API Explorer', description: 'Test our REST API' },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'editor':
        return <CodeEditor />;
      case 'api':
        return <ApiExplorer />;
      case 'live':
        return <LiveDemo />;
      default:
        return <LiveDemo />;
    }
  };

  return (
    <section id="demo" className="py-24 bg-cursor-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cursor-text-primary mb-6 tracking-tight">
            Experience NeuroLint
          </h2>
          <p className="text-lg sm:text-xl text-cursor-text-secondary max-w-3xl mx-auto font-medium">
            Try our AI-powered code analysis tools directly in your browser
          </p>
        </div>

        {/* View Selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {views.map((view) => (
            <button aria-label="Button"
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-cursor-accent-blue text-white shadow-cursor-glow'
                  : 'bg-cursor-surface border border-cursor-border text-cursor-text-primary hover:bg-cursor-card hover:border-cursor-text-muted'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">{view.name}</div>
                <div className={`text-xs ${
                  activeView === view.id ? 'text-white/80' : 'text-cursor-text-secondary'
                }`}>
                  {view.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active View */}
        <div className="transition-all duration-300">
          {renderActiveView()}
        </div>
      </div>
    </section>
  );
}; 