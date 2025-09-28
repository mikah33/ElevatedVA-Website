# ElevatedVA Website

A modern landing page for ElevatedVA with Supabase authentication that works across web and iOS.

## Features

- 🎨 Modern purple/dark theme with animated bubble effects
- 🔐 Supabase authentication (email/password and Google)
- 📱 Fully responsive design (mobile-optimized)
- 🍔 Hamburger menu navigation
- 👤 Account management section
- 💳 Subscription ready (Stripe integration placeholder)
- 🤝 Partnership section with Elevated AI

## Setup

1. **Start the local server:**
   ```bash
   npm start
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Supabase Configuration

The website is configured to use your Supabase project:
- Project ID: `csarhyiqmprbnvfosmde`
- URL: `https://csarhyiqmprbnvfosmde.supabase.co`

### Enable Google Authentication

To enable Google sign-in:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials
5. Add `http://localhost:3000` to authorized redirect URLs

### Database Setup

For full functionality, create these tables in Supabase:

```sql
-- Users profile table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  app_source TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Deploy to Netlify

1. Push to GitHub
2. Connect to Netlify
3. Deploy with default settings

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

## Cross-Platform Authentication

This authentication system works seamlessly between:
- This web application
- Your iOS app
- Any other app using the same Supabase project

Users can sign up on any platform and sign in on any other platform with the same credentials.

## Customization

- **Colors**: Edit CSS variables in `styles.css`
- **Content**: Update text in `index.html`
- **Features**: Add new sections as needed

## Security Note

For production:
- Move Supabase keys to environment variables
- Enable Row Level Security (RLS) in Supabase
- Set up proper CORS policies

## Support

Made with 💜 by business owners, for business owners.