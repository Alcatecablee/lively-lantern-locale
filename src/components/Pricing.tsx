import { useState } from 'react';
import { Check, Star, Users, Zap, Sparkles } from 'lucide-react';
import { PaymentModal } from './payments/PaymentModal';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    features: [
      '5 analyses per month',
      'Basic 6-layer analysis',
      'Issue detection',
      'Basic recommendations',
      'Community support'
    ],
    cta: 'Start Free',
    popular: false,
    ariaLabel: 'Free plan - perfect for getting started',
    isSubscription: false,
    icon: <Zap className="h-5 w-5" />,
    limit: '5 analyses/month',
    gradient: 'from-cursor-accent-green/20 to-cursor-accent-blue/20'
  },
  {
    name: 'Pro',
    price: '19',
    description: 'For professional developers',
    features: [
      'Unlimited analyses',
      'Advanced 6-layer analysis',
      'Auto-fix suggestions',
      'Custom rules & configurations',
      'Priority support',
      'Performance insights',
      'Export reports'
    ],
    cta: 'Start Pro Trial',
    popular: true,
    ariaLabel: 'Pro plan - for professional developers - most popular',
    isSubscription: true,
    icon: <Sparkles className="h-5 w-5" />,
    limit: 'Unlimited',
    gradient: 'from-cursor-accent-blue/20 to-cursor-accent-purple/20'
  },
  {
    name: 'Team',
    price: '49',
    description: 'For development teams',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared analysis history',
      'Team dashboard',
      'Role-based access',
      'Advanced reporting',
      'CI/CD integration'
    ],
    cta: 'Start Team Trial',
    popular: false,
    ariaLabel: 'Team plan - for development teams',
    isSubscription: true,
    icon: <Users className="h-5 w-5" />,
    limit: 'Team features',
    gradient: 'from-cursor-accent-purple/20 to-cursor-accent-pink/20'
  },
  {
    name: 'Enterprise',
    price: '199',
    description: 'For large organizations',
    features: [
      'Everything in Team',
      'Custom analysis rules',
      'API access',
      'SSO integration',
      'Advanced reporting',
      'Dedicated support',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    popular: false,
    ariaLabel: 'Enterprise plan - for large organizations',
    isSubscription: true,
    icon: <Star className="h-5 w-5" />,
    limit: 'Custom rules & API',
    gradient: 'from-cursor-accent-pink/20 to-cursor-accent-blue/20'
  }
];

export const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const handlePlanAction = (plan: typeof plans[0]) => {
    if (plan.name === 'Free') {
      console.debug('Free plan selected');
      return;
    }

    // TEMPORARILY DISABLE PAID PLANS UNTIL FEATURES ARE IMPLEMENTED
    if (plan.name === 'Pro' || plan.name === 'Team') {
      toast({
        title: "Coming Soon!",
        description: `${plan.name} plan features are currently under development. We'll notify you when they're ready!`,
        variant: "default",
      });
      return;
    }

    if (plan.name === 'Enterprise') {
      toast({
        title: "Enterprise Consultation",
        description: "Our enterprise features are in development. Contact us to discuss your requirements and early access.",
        variant: "default",
      });
      return;
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-cursor-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cursor-accent-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cursor-accent-purple/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-cursor-text-primary mb-6 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-lg sm:text-xl text-cursor-text-secondary max-w-3xl mx-auto font-medium">
            Choose the plan that fits your needs. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${
                plan.popular 
                  ? 'lg:scale-105 lg:-translate-y-4' 
                  : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="inline-flex items-center px-4 py-1.5 bg-gradient-cursor-blue text-white text-sm font-semibold rounded-full shadow-cursor-glow">
                    <Star className="w-3 h-3 mr-1.5" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`
                card-cursor-hover h-full p-8 relative overflow-hidden
                ${plan.popular ? 'border-cursor-accent-blue/50 shadow-cursor-lg' : ''}
              `}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-50`}></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-6
                    ${plan.popular ? 'bg-cursor-accent-blue text-white' : 'bg-cursor-surface text-cursor-text-secondary'}
                  `}>
                    {plan.icon}
                  </div>

                  {/* Plan Info */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-cursor-text-primary mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-cursor-text-secondary text-sm mb-4">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-black text-cursor-text-primary">
                        ${plan.price}
                      </span>
                      {plan.price !== '0' && (
                        <span className="text-cursor-text-secondary ml-2 font-medium">
                          /month
                        </span>
                      )}
                    </div>

                    {/* Limit Badge */}
                    <div className="inline-block px-3 py-1 bg-cursor-surface border border-cursor-border rounded-full text-xs font-medium text-cursor-text-secondary">
                      {plan.limit}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-4 h-4 text-cursor-accent-green mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-cursor-text-secondary">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button aria-label="Button"
                    onClick={() => handlePlanAction(plan)}
                    onKeyDown={(e) => handleKeyDown(e, () => handlePlanAction(plan))}
                    className={`
                      w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
                      ${plan.popular 
                        ? 'btn-cursor-primary' 
                        : 'btn-cursor-secondary'
                      }
                    `}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-cursor-text-secondary font-medium">
            All paid plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={closePaymentModal}
          planName={selectedPlan.name}
          price={selectedPlan.price}
          description={selectedPlan.description}
          features={selectedPlan.features}
          isSubscription={selectedPlan.isSubscription}
        />
      )}
    </section>
  );
};