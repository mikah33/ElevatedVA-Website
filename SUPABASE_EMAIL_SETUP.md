# 📧 Supabase Auth Email Template Setup

## 🎨 Template Features
- Matches ElevatedVA purple gradient theme
- Mobile-responsive design
- Dark mode optimized
- Glass morphism effects
- Feature showcase grid
- Security notices
- Works in all email clients

## 🚀 How to Use in Supabase

### Step 1: Go to Supabase Dashboard
1. Navigate to **Authentication** → **Email Templates**
2. Select the email type you want to customize:
   - Confirm signup
   - Reset password
   - Magic link
   - Invite user
   - Change email address

### Step 2: Enable Custom Template
1. Toggle "Enable Custom Email" to ON
2. Copy the HTML from `auth-email-template.html`

### Step 3: Replace Variables
Supabase uses these variables - they're already in the template:
- `{{ .ConfirmationURL }}` - The action link
- `{{ .EmailTitle }}` - Email subject/title
- `{{ .EmailBody }}` - Main message
- `{{ .EmailAction }}` - Button text
- `{{ .ExpirationTime }}` - Link expiration

### Step 4: Customize for Each Email Type

#### **Signup Confirmation**
```html
{{ .EmailTitle }} = "Confirm Your Email"
{{ .EmailBody }} = "Thanks for signing up for ElevatedVA! Please confirm your email address to get started with your AI phone assistant."
{{ .EmailAction }} = "Confirm Email"
{{ .ExpirationTime }} = "24 hours"
```

#### **Password Reset**
```html
{{ .EmailTitle }} = "Reset Your Password"
{{ .EmailBody }} = "We received a request to reset your password. Click the button below to create a new password."
{{ .EmailAction }} = "Reset Password"
{{ .ExpirationTime }} = "1 hour"
```

#### **Magic Link**
```html
{{ .EmailTitle }} = "Your Magic Link"
{{ .EmailBody }} = "Click the button below to instantly sign in to your ElevatedVA dashboard. No password needed!"
{{ .EmailAction }} = "Sign In"
{{ .ExpirationTime }} = "10 minutes"
```

#### **Welcome Email (After Confirmation)**
```html
{{ .EmailTitle }} = "Welcome to ElevatedVA! 🎉"
{{ .EmailBody }} = "Your AI phone assistant is ready! Your 3-day free trial starts now. Let's set up your phone number and greeting."
{{ .EmailAction }} = "Go to Dashboard"
```

## 📝 Supabase Email Settings

### SMTP Configuration (Optional but Recommended)
For better deliverability, use a custom SMTP:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_SENDER_EMAIL=noreply@elevatedva.com
SMTP_SENDER_NAME=ElevatedVA
```

### Rate Limits
Default Supabase limits:
- 4 emails per hour per user (free tier)
- 30 emails per hour (pro tier)

### Testing Your Template
1. Use Supabase's "Send Test Email" button
2. Check these email clients:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile Gmail app

## 🎨 Customization Options

### Change Colors
Replace these values in the template:

```css
/* Primary Purple */
#7C3AED → Your primary color
#5B3ACC → Your secondary color

/* Background */
#0f0817 → Your dark background
#1a0f2e → Your gradient background

/* Text Colors */
#E5E7EB → Primary text
#D1D5DB → Secondary text
#9CA3AF → Muted text
```

### Add Your Logo
Replace the "E" logo div with:

```html
<img src="https://your-domain.com/logo.png"
     alt="ElevatedVA"
     style="width: 80px; height: 80px; border-radius: 20px;">
```

### Modify Features Grid
The 4 feature boxes can be customized:

```html
<div style="font-size: 24px;">📞</div>
<p style="color: #D1D5DB;">24/7 Availability</p>
```

## 🐛 Troubleshooting

### Email Not Arriving?
- Check spam folder
- Verify email in Supabase logs
- Ensure custom template is enabled
- Check SMTP settings if using custom

### Broken Layout?
- Some email clients strip CSS
- Use inline styles only
- Test with Litmus or Email on Acid

### Variables Not Working?
- Use exact Supabase variable syntax
- Don't add spaces: `{{.Variable}}` not `{{ .Variable }}`
- Check Supabase docs for latest variables

## 📱 Mobile Optimization Tips
- Keep width under 600px
- Use single column on mobile
- Minimum font size: 14px
- Touch targets: 44px minimum
- Test on real devices

## 🔒 Security Best Practices
1. Always include expiration warning
2. Add "Didn't request this?" message
3. Use HTTPS for all links
4. Don't include sensitive data in email
5. Add unsubscribe link for marketing emails

## 📊 Tracking (Optional)
Add UTM parameters to links:

```
?utm_source=email&utm_medium=auth&utm_campaign=signup
```

## 🚀 Pro Tips
1. Keep subject lines under 50 characters
2. Preheader text: First 90 characters matter
3. Test dark mode appearance
4. Use emojis sparingly (they don't always render)
5. Include alt text for images

---

## Need Help?
- Supabase Docs: https://supabase.com/docs/guides/auth/auth-email-templates
- Email Testing: https://www.mail-tester.com/
- HTML Email Guide: https://www.htmlemailcheck.com/