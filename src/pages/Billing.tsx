
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PricingCard } from '@/components/billing/PricingCard';
import { PayPalSubscription } from '@/components/billing/PayPalSubscription';
import { UsageDisplay } from '@/components/billing/UsageDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRICING_PLANS, type PlanType } from '@/lib/config/pricing';
import { CreditCard, Zap } from 'lucide-react';

const Billing = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubscribe = (plan: PlanType) => {
    if (plan === 'free') return;
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    // Refresh user data
    window.location.reload();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedPlan(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] flex items-center justify-center">
        <Card className="bg-black/50 border-gray-700 p-8">
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
            <p className="text-gray-400">You need to be signed in to view billing information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of NeuroLint with our flexible pricing plans
          </p>
        </div>

        {user && (
          <div className="mb-8 max-w-md mx-auto">
            <UsageDisplay />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {(Object.keys(PRICING_PLANS) as PlanType[]).map((plan) => (
            <PricingCard
              key={plan}
              plan={plan}
              currentPlan={user?.plan_type}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-black/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Enterprise Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>Need custom deployment or team features?</p>
              <p>Contact us for enterprise pricing and custom solutions.</p>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                Secure Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-2">
              <p>All payments are processed securely through PayPal.</p>
              <p>Cancel anytime with no hidden fees.</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="bg-black/90 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Subscribe to {selectedPlan && PRICING_PLANS[selectedPlan].name}
              </DialogTitle>
            </DialogHeader>
            {selectedPlan && (
              <PayPalSubscription
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Billing;
