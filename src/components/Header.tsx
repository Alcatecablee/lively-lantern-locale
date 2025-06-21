import React from 'react';
import { Link } from 'react-router-dom';
import { UserButton } from './auth/UserButton';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
          NeuroLint
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/features" className="text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
            Blog
          </Link>
          <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/docs" className="text-gray-300 hover:text-white transition-colors">
            Documentation
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
};
