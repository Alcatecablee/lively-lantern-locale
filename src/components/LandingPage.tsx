import React from 'react'
import { Header } from './Header'
import { Hero } from './Hero'
import { Features } from './Features'
import { DemoPage } from './DemoPage'
import { HowItWorks } from './HowItWorks'
import { Testimonials } from './Testimonials'
import { SocialProof } from './SocialProof'
import { Footer } from './Footer'

interface LandingPageProps extends React.HTMLAttributes<HTMLDivElement> {
  onGetStarted: () => void;
  onShowAdmin?: () => void;
  onShowDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGetStarted, 
  onShowAdmin, 
  onShowDashboard 
}) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header 
        onGetStarted={onGetStarted} 
        onShowAdmin={onShowAdmin}
        onShowDashboard={onShowDashboard}
      />
      <main className="w-full">
        <Hero onGetStarted={onGetStarted} />
        <SocialProof />
        <DemoPage />
        <Features />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};