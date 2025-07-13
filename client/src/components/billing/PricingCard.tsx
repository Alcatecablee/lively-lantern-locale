
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PRICING_PLANS, type PlanType } from '@/lib/config/pricing';

interface PricingCardProps {
  plan: PlanType;
  currentPlan?: PlanType;
  onSubscribe: (plan: PlanType) => void;
  loading?: boolean;
}

export function PricingCard({ plan, currentPlan, onSubscribe, loading }: PricingCardProps) {
  const planData = PRICING_PLANS[plan];
  const isCurrentPlan = currentPlan === plan;
  const isFree = plan === 'free';

  return (
    <Card className={`relative ${planData.popular ? 'border-purple-500 border-2' : 'border-gray-700'} bg-black/50 backdrop-blur-sm`}>
      {planData.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-white">{planData.name}</CardTitle>
        <div className="text-4xl font-bold text-white">
          ${planData.price}
          <span className="text-lg font-normal text-gray-400">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {planData.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-gray-300">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button
          onClick={() => onSubscribe(plan)}
          disabled={loading || isCurrentPlan}
          className={`w-full font-semibold ${
            planData.popular
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started Free' : planData.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
