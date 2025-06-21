import React from 'react';
import { Zap, Github, Twitter, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Development Status', href: '#development-status' },
      { name: 'Changelog', href: '#changelog' },
    ],
    support: [
      { name: 'Documentation', href: '#docs' },
      { name: 'Community', href: '#community' },
      { name: 'Contact', href: '#contact' },
      { name: 'Bug Reports', href: '#bugs' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Privacy', href: '#privacy' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Security', href: '#security' },
    ],
  };

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/neurolint',
      icon: <Github className="h-5 w-5" />,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/neurolint',
      icon: <Twitter className="h-5 w-5" />,
    },
    {
      name: 'Email',
      href: 'mailto:hello@neurolint.dev',
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="bg-cursor-bg border-t border-cursor-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-cursor-blue">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-cursor-text-primary tracking-tight">
                NeuroLint
              </span>
            </div>
            <p className="text-cursor-text-secondary leading-relaxed mb-6 max-w-md">
              Intelligent, fast, and familiar. The best way to analyze React & TypeScript code with AI-powered insights and automated fixes.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className="p-2 rounded-lg bg-cursor-surface hover:bg-cursor-card border border-cursor-border text-cursor-text-secondary hover:text-cursor-text-primary transition-all duration-200"
                  aria-label={link.name}
                >
                  {link.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-cursor-text-primary uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleLinkClick(item.href)}
                      className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-cursor-text-primary uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleLinkClick(item.href)}
                      className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-cursor-text-primary uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleLinkClick(item.href)}
                      className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-cursor-text-primary uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleLinkClick(item.href)}
                      className="text-cursor-text-secondary hover:text-cursor-text-primary transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-cursor-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-cursor-text-secondary">
              <span>&copy; {currentYear} NeuroLint. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-1 text-sm text-cursor-text-secondary">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-cursor-accent-pink mx-1" />
              <span>for developers</span>
            </div>

            <div className="text-sm text-cursor-text-muted">
              Version 2.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};