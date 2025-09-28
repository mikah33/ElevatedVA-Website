-- Create billing history table to track payments
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    stripe_invoice_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    description TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own billing history
DROP POLICY IF EXISTS "Users can view own billing history" ON public.billing_history;
CREATE POLICY "Users can view own billing history" ON public.billing_history
    FOR SELECT USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON public.billing_history(created_at DESC);

-- Insert sample billing history for testing (optional)
-- Replace 'YOUR_USER_ID' with your actual user ID: 8828e7d7-65f3-4f23-b422-8403c2f4ec6a
/*
INSERT INTO public.billing_history (user_id, amount, status, description, paid_at)
VALUES
    ('8828e7d7-65f3-4f23-b422-8403c2f4ec6a', 39.99, 'paid', 'Professional Plan - Monthly', NOW()),
    ('8828e7d7-65f3-4f23-b422-8403c2f4ec6a', 39.99, 'paid', 'Professional Plan - Monthly', NOW() - INTERVAL '1 month'),
    ('8828e7d7-65f3-4f23-b422-8403c2f4ec6a', 39.99, 'paid', 'Professional Plan - Monthly', NOW() - INTERVAL '2 months');
*/