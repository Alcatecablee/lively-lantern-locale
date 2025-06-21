import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/auth/AuthPage';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { NeuroLint } from '@/components/NeuroLint';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage 
        onBack={() => navigate('/')}
        onSuccess={() => navigate('/dashboard')}
      />
    );
  }

  // If user is authenticated, show the main NeuroLint component in dashboard mode
  return (
    <>
      <Helmet>
        <title>Dashboard - NeuroLint</title>
        <meta name="description" content="Your NeuroLint analysis dashboard" />
      </Helmet>

      <NeuroLint />
    </>
  );
};

export default DashboardPage; 