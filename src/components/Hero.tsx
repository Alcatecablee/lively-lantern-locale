import { useState, useEffect } from 'react';
import { ArrowRight, Code, Zap, Shield, Brain } from 'lucide-react';

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const animatedTexts = [
    'Code analysis reimagined',
    'AI-powered insights',
    'React code perfected',
    'TypeScript mastery',
    'Bugs eliminated fast'
  ];

  useEffect(() => {
    const currentText = animatedTexts[currentTextIndex];
    const typeSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 1000 : 2000;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
          setCharIndex(0);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, currentTextIndex, animatedTexts]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-visible pt-16">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full px-6 py-3 mb-8 animate-fade-up shadow-lg shadow-blue-500/10">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ✨ AI-Powered Code Analysis
            </span>
          </div>

          {/* Animated Main Heading */}
          <div className="mb-6 animate-fade-up delay-100">
            <div className="pt-8 pb-16 text-center overflow-visible">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.6] tracking-tight pb-8 overflow-visible">
                <span className="inline-block text-white whitespace-nowrap overflow-visible drop-shadow-lg" style={{
                  textShadow: '0 0 10px rgba(59, 130, 246, 0.3), 0 0 20px rgba(147, 51, 234, 0.2)'
                }}>
                  {displayText}
                </span>
              </h1>
            </div>
          </div>

          {/* Enhanced Subheading with Staggered Animation */}
          <div className="mb-8 animate-fade-up delay-200">
            <p className="text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium">
              <span className="inline-block animate-fade-in-up delay-300">NeuroLint uses</span>{' '}
              <span className="inline-block animate-fade-in-up delay-400 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent font-semibold">advanced AI</span>{' '}
              <span className="inline-block animate-fade-in-up delay-500">to analyze your</span>{' '}
              <span className="inline-block animate-fade-in-up delay-600 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">React code</span>{' '}
              <span className="inline-block animate-fade-in-up delay-700">across</span>{' '}
              <span className="inline-block animate-fade-in-up delay-800 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">6 intelligent layers</span>{' '}
              <span className="inline-block animate-fade-in-up delay-900 text-gray-300">, catching issues before they become problems.</span>
            </p>
          </div>

          {/* Enhanced Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-up delay-300">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-500/20 shadow-lg shadow-blue-500/10 animate-fade-in-up delay-1000">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">6-Layer Analysis</span>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/20 shadow-lg shadow-purple-500/10 animate-fade-in-up delay-1100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Auto-Fix Issues</span>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 backdrop-blur-sm rounded-full px-4 py-2 border border-green-500/20 shadow-lg shadow-green-500/10 animate-fade-in-up delay-1200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Privacy First</span>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up delay-400">
            <button
              onClick={onGetStarted}
              className="relative group h-16 px-10 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] rounded-2xl shadow-2xl shadow-blue-500/25 animate-shimmer hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 overflow-hidden"
             aria-label="Button">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-[length:200%_100%] opacity-0 group-hover:opacity-100 animate-shimmer transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <span>Try NeuroLint Free</span>
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
              </div>
            </button>

            <button aria-label="Button"
              onClick={() => {
                const element = document.querySelector('#demo');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group h-16 px-10 text-lg font-bold text-white bg-transparent border-2 border-gray-600 rounded-2xl hover:border-purple-500 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-3 animate-pulse"></div>
                <span className="bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">Watch Demo</span>
              </div>
            </button>
          </div>

          {/* Enhanced Stats with Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 pt-16 border-t border-gray-800/50 animate-fade-up delay-500">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent animate-counter" data-target="99">99%</div>
              <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Issue Detection Rate</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-counter" data-target="5.2">5.2s</div>
              <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Average Analysis Time</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-counter" data-target="80">80%</div>
              <div className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Auto-Fixable Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-2 border-blue-400/50 rounded-full flex justify-center shadow-lg shadow-blue-500/25 bg-gradient-to-b from-blue-500/10 to-transparent backdrop-blur-sm">
          <div className="w-2 h-4 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};