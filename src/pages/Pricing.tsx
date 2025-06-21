import { useState } from 'react'
import { Check, Star, Zap, Building2, Crown } from 'lucide-react'
import { PayPalProvider } from '@/components/payments/PayPalProvider'
import { PayPalButton } from '@/components/payments/PayPalButton'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { PayPalProvider } from "@/components/payments/PayPalProvider"
const PricingCard = ({
  name, 
  price, 
  period,
  description, 
  features, 
  highlighted = false,
  popular = false,
  icon: Icon,
  planType,
  buttonText = "Get Started"
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
  icon: any;
  planType: string;
  buttonText?: string;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPayPal, setShowPayPal] = useState(false);

  const handleGetStarted = () => {
    if (planType === 'free') {
      if (!user) {
        toast({
          title: "Sign Up Required",
          description: "Please sign up to get started with the free plan",
        });
        return;
      }
      toast({
        title: "Free Plan Active",
        description: "You're already on the free plan! Start analyzing your code.",
      });
    } else if (planType === 'enterprise') {
      window.open('mailto:contact@neurolint.com?subject=Enterprise Plan Inquiry', '_blank');
    } else {
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to subscribe to a paid plan",
        });
        return;
      }
      setShowPayPal(true);
    }
  };

  const handlePaymentSuccess = (details: any) => {
    console.debug('Payment successful:', details);
    setShowPayPal(false);
    toast({
      title: "Welcome to " + name + "!",
      description: "Your subscription is now active. Start exploring premium features!",
    });
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    setShowPayPal(false);
  };

  return (
    <div className="relative max-w-sm mx-auto">
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-cursor-accent-purple text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </div>
        </div>
      )}

      <div className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
        highlighted 
          ? 'bg-cursor-accent-purple/10 border-2 border-cursor-accent-purple shadow-2xl shadow-cursor-accent-purple/20' 
          : 'card-cursor border-cursor-border/50 hover:border-cursor-border'
      }`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
            highlighted ? 'bg-cursor-accent-purple text-white' : 'bg-cursor-surface text-cursor-text-secondary'
          }`}>
            <Icon className="h-6 w-6" />
          </div>

          <h3 className="text-2xl font-bold text-cursor-text-primary">{name}</h3>

          <div className="mt-4 flex items-baseline justify-center">
            <span className="text-5xl font-bold text-cursor-text-primary">{price}</span>
            {period && <span className="text-lg font-medium text-cursor-text-secondary ml-1">{period}</span>}
          </div>

          <p className="mt-4 text-cursor-text-secondary">{description}</p>
        </div>

        <div className="mt-8">
          {!showPayPal ? (
            <button
              onClick={handleGetStarted}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                highlighted 
                  ? 'btn-cursor-primary' 
                  : 'btn-cursor-secondary'
              }`}
             aria-label="Button">
              {buttonText}
            </button>
          ) : (
            <PayPalProvider>
              <div className="border border-cursor-border rounded-lg p-4">
                <PayPalButton
                  planName={name}
                  amount={price.replace('$', '')}
                  isSubscription={true}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                <button
                  onClick={() => setShowPayPal(false)}
                  aria-label="Cancel PayPal payment"
                  className="w-full mt-2 text-cursor-text-secondary hover:text-cursor-text-primary text-sm"
                >
                  Cancel
                </button>
              </div>
            </PayPalProvider>
          )}
        </div>

        <ul className="mt-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                highlighted ? 'text-cursor-accent-purple' : 'text-cursor-accent-green'
              }`} />
              <span className="text-cursor-text-secondary text-sm">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-cursor-background">
      {/* Header */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-cursor-text-primary mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-cursor-text-secondary max-w-2xl mx-auto">
            Choose the perfect plan for your development workflow. 
            All plans include our core AI-powered code analysis features.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:gap-12 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {/* Free Plan */}
          <PricingCard
            name="Free"
            price="$0"
            period="/month"
            description="Perfect for individual developers getting started"
            icon={Zap}
            planType="free"
            features={[
              'Up to 5 analyses per month',
              'Basic 6-layer analysis',
              'Issue detection',
              'Basic recommendations',
              'Community support'
            ]}
          />

          {/* Pro Plan */}
          <PricingCard
            name="Pro"
            price="$19"
            period="/month"
            description="For professional developers who need more power"
            icon={Crown}
            planType="pro"
            highlighted={true}
            popular={true}
            features={[
              'Unlimited analyses',
              'Advanced 6-layer analysis',
              'Auto-fix suggestions',
              'Custom rules & configurations',
              'Priority support',
              'Performance insights',
              'Export reports'
            ]}
          />

          {/* Team Plan */}
          <PricingCard
            name="Team"
            price="$49"
            period="/month"
            description="For development teams and organizations"
            icon={Building2}
            planType="team"
            features={[
              'Everything in Pro',
              'Team collaboration',
              'Shared analysis history',
              'Team dashboard',
              'Role-based access',
              'Advanced reporting',
              'CI/CD integration'
            ]}
          />
        </div>

        {/* Enterprise */}
        <div className="max-w-2xl mx-auto mb-16">
          <PricingCard
            name="Enterprise"
            price="Custom"
            description="For large organizations with custom requirements"
            icon={Building2}
            planType="enterprise"
            buttonText="Contact Sales"
            features={[
              'Everything in Team',
              'Custom deployment options',
              'Dedicated support team',
              'SLA guarantees',
              'Custom integrations',
              'Advanced security features',
              'Training & onboarding'
            ]}
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-cursor-text-primary mb-4">
            Frequently asked questions
          </h2>
          <p className="text-cursor-text-secondary">
            Can't find the answer you're looking for? Reach out to our support team.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">
              Can I change plans anytime?
            </h3>
            <p className="text-cursor-text-secondary">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">
              Is there a free trial?
            </h3>
            <p className="text-cursor-text-secondary">
              Our Free plan is completely free forever. For paid plans, we offer a 14-day free trial.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cursor-text-primary mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-cursor-text-secondary">
              We accept all major credit cards and PayPal. Enterprise customers can pay via invoice.
            </p>
          </div>

          <div><h3 className="text-lg font-semibold text-cursor-text-primary mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-cursor-text-secondary">
              Yes, we offer full refunds within 30 days of purchase if you're not satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};