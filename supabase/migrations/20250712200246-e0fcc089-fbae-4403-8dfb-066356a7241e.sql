
-- Create subscriptions table for PayPal integration
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  paypal_subscription_id TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own subscriptions
CREATE POLICY "users_can_view_own_subscriptions" ON public.subscriptions
  FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true)));

-- Create policy for users to insert their own subscriptions
CREATE POLICY "users_can_insert_own_subscriptions" ON public.subscriptions
  FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true)));

-- Create the increment_monthly_usage function
CREATE OR REPLACE FUNCTION public.increment_monthly_usage(clerk_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM public.users WHERE clerk_id = clerk_user_id;
  
  IF user_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has exceeded their limit
  IF user_record.monthly_transformations_used >= user_record.monthly_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  UPDATE public.users 
  SET monthly_transformations_used = monthly_transformations_used + 1,
      updated_at = now()
  WHERE clerk_id = clerk_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_paypal_id ON public.subscriptions(paypal_subscription_id);
