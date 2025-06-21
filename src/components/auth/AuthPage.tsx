import React, { useState } from 'react';
import { AuthHeader } from './AuthHeader';
import { AuthForm } from './AuthForm';

interface AuthPageProps extends React.HTMLAttributes<HTMLDivElement> {
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <AuthHeader isLogin={isLogin} onBack={onBack} />
        <AuthForm 
          isLogin={isLogin} 
          onSuccess={onSuccess} 
          onToggleMode={handleToggleMode} 
        />
      </div>
    </div>
  );
};