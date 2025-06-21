
import { PRICING_PLANS } from "@/lib/config/pricing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-8 bg-gradient-to-br from-[#22242B] via-[#181921] to-[#16151a] dark">
      <div className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose the plan that works best for you. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        {Object.entries(PRICING_PLANS).map(([key, plan]) => (
          <Card 
            key={key}
            className={`relative ${
              plan.popular 
                ? 'border-purple-400 shadow-lg shadow-purple-400/20' 
                : 'border-[#292939]'
            } bg-black/80 backdrop-blur-lg`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-400">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full mt-6 ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-400 max-w-2xl">
        <p className="text-sm">
          All plans include secure PayPal payments and guest checkout options. 
          No hidden fees. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
