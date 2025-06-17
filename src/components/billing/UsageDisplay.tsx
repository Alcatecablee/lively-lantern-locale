
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { PRICING_PLANS } from '@/lib/config/pricing';

export function UsageDisplay() {
  const { user } = useAuth();

  if (!user) return null;

  const planData = PRICING_PLANS[user.plan_type];
  const isUnlimited = user.monthly_limit >= 999999;
  const usagePercentage = isUnlimited ? 0 : (user.monthly_transformations_used / user.monthly_limit) * 100;

  return (
    <Card className="bg-black/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Monthly Usage</span>
          <span className="text-sm font-normal text-purple-400 capitalize">
            {user.plan_type} Plan
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUnlimited ? (
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">Unlimited</p>
            <p className="text-gray-400">Transformations this month: {user.monthly_transformations_used}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Transformations used</span>
              <span className="text-white">
                {user.monthly_transformations_used} / {user.monthly_limit}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {usagePercentage >= 90 && (
              <p className="text-yellow-500 text-sm">
                You're approaching your monthly limit. Consider upgrading to Pro for unlimited transformations.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
