import React from 'react'
import { ArrowLeft } from 'lucide-react'

interface AuthHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  isLogin: boolean;
  onBack: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ isLogin, onBack }) => {
  return (
    <div className="text-center">
      <button
        onClick={onBack}
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        aria-label="Back">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </button>
      <h2 className="text-3xl font-bold text-white">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="mt-2 text-gray-400">
        {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
      </p>
    </div>
  );
};