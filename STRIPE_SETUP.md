# Stripe Integration Setup

## Current Status
Your website now shows your Stripe Customer ID: **cus_T4rwMDcwPSrcO3**

## To Complete Stripe Integration:

### Option 1: Use Stripe Customer Portal (Easiest)
1. Go to your Stripe Dashboard
2. Navigate to **Settings > Customer portal**
3. Configure the portal settings
4. Get your portal configuration ID
5. Update the `openStripePortal` function in app.js with your portal URL

### Option 2: Direct API Integration
To fetch billing history directly in the app, you need:

1. **Create a Supabase Edge Function**:
   ```javascript
   // supabase/functions/stripe-billing/index.ts
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

   const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

   serve(async (req) => {
     const { customerId } = await req.json()

     const invoices = await stripe.invoices.list({
       customer: customerId,
       limit: 10
     })

     return new Response(JSON.stringify(invoices), {
       headers: { 'Content-Type': 'application/json' }
     })
   })
   ```

2. **Set your Stripe secret key in Supabase**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   ```

3. **Deploy the function**:
   ```bash
   supabase functions deploy stripe-billing
   ```

### Option 3: Use Existing Stripe Portal
Since you already have Stripe set up with your iOS app, you can:

1. Use the same Stripe Customer Portal URL
2. The customer portal allows users to:
   - View all invoices and receipts
   - Download invoices as PDFs
   - Update payment methods
   - Cancel subscriptions

## Your Customer Information:
- **Customer ID**: cus_T4rwMDcwPSrcO3
- **Plan**: Monthly ($39.99)
- **Status**: Active
- **Next Billing**: October 18, 2025

## Security Note:
Never expose your Stripe secret key in client-side code. Always use:
- Supabase Edge Functions
- Your own backend API
- Stripe Customer Portal (recommended)