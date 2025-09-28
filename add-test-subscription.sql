-- First, let's check if your user exists and get their ID
SELECT id, email, created_at
FROM auth.users
WHERE email = 'mikah.albertson@elevatedsystems.info';

-- If the user exists, you can run this to add a test subscription
-- Replace 'YOUR_USER_ID_HERE' with the actual ID from the query above
/*
INSERT INTO public.subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    plan,
    status,
    current_period_start,
    current_period_end
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with actual user ID
    'cus_test_' || gen_random_uuid()::text,
    'sub_test_' || gen_random_uuid()::text,
    'price_test_monthly',
    'professional',
    'active',
    NOW(),
    NOW() + INTERVAL '30 days'
)
ON CONFLICT (id) DO NOTHING;
*/

-- To check existing subscriptions:
SELECT * FROM public.subscriptions;

-- To manually update a user's subscription to active:
/*
UPDATE public.subscriptions
SET status = 'active',
    plan = 'professional',
    current_period_end = NOW() + INTERVAL '30 days'
WHERE user_id = 'YOUR_USER_ID_HERE';
*/