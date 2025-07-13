
-- NeuroLint Database Schema for Production
-- Designed for Clerk.com authentication integration

-- Users table (synced with Clerk)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  monthly_transformations_used INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  paypal_subscription_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transformation history
CREATE TABLE public.transformations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT,
  original_code_length INTEGER,
  transformed_code_length INTEGER,
  layers_used INTEGER[],
  changes_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  is_guest BOOLEAN DEFAULT false,
  guest_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage analytics
CREATE TABLE public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  transformations_count INTEGER DEFAULT 0,
  total_execution_time_ms INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Payments table (for PayPal integration)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  paypal_payment_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_type TEXT DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'one_time')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (clerk_id = current_setting('app.current_user_clerk_id', true));

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (clerk_id = current_setting('app.current_user_clerk_id', true));

-- RLS Policies for subscriptions
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true)));

-- RLS Policies for transformations
CREATE POLICY "transformations_select_own" ON public.transformations
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true))
    OR is_guest = true
  );

CREATE POLICY "transformations_insert_own" ON public.transformations
  FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true))
    OR is_guest = true
  );

-- RLS Policies for usage analytics
CREATE POLICY "usage_analytics_select_own" ON public.usage_analytics
  FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true)));

-- RLS Policies for payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('app.current_user_clerk_id', true)));

-- Functions for usage tracking
CREATE OR REPLACE FUNCTION increment_monthly_usage(clerk_user_id TEXT)
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

-- Function to reset monthly usage (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE public.users 
  SET monthly_transformations_used = 0,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX idx_transformations_user_id ON public.transformations(user_id);
CREATE INDEX idx_transformations_created_at ON public.transformations(created_at);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_usage_analytics_user_date ON public.usage_analytics(user_id, date);
