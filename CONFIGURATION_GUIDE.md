# Configuration Guide for VilĀura E-commerce

## Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://ttynpoekdlemfriqvhte.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW5wb2VrZGxlbWZyaXF2aHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjgyNzgsImV4cCI6MjA2OTA0NDI3OH0.GYI6o7OrqXa4vgCXEKKTU-YX3AXn4EZGQFJnXfzzfJY

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZGVhci1zaGVlcC0zNy5jbGVyay5hY2NvdW50cy5kZXYk

# Resend Email Configuration (Required for email notifications)
VITE_RESEND_API_KEY=your-resend-api-key-here

# Payment Gateway Configuration (for future integration)
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# App Configuration
VITE_APP_NAME=VilĀura
VITE_APP_URL=http://localhost:5173
```

## Email Notification Setup

### 1. Resend API Key Setup

1. Go to [Resend.com](https://resend.com) and create an account
2. Get your API key from the dashboard
3. Add the API key to your `.env` file
4. Update the Supabase function environment variables:

```bash
# Set the Resend API key in Supabase
supabase secrets set RESEND_API_KEY=your-resend-api-key-here
```

### 2. Update Email Configuration

The email notifications are configured in `supabase/functions/create-order/index.ts`. The current configuration sends emails to:
- aksharthakkar774@gmail.com
- vilaura.official@gmail.com

To change the recipient emails, update the `to` field in the email configuration.

## Payment Integration Setup

### Current Status
- ✅ Mock payment system implemented
- ✅ Payment method selection
- ✅ Payment simulation with success/failure rates
- ✅ Order creation after successful payment

### Future Integration Options

#### Option 1: Razorpay Integration
```bash
npm install razorpay
```

#### Option 2: Stripe Integration
```bash
npm install @stripe/stripe-js
```

## Database Setup

The following tables should exist in your Supabase database:

1. `products` - Product information
2. `orders` - Order details
3. `order_items` - Order line items
4. `users` - User information (if using Supabase auth)

## Testing the System

1. **Test Email Notifications:**
   - Place a test order
   - Check if emails are received
   - Check Supabase function logs for errors

2. **Test Payment Flow:**
   - Add items to cart
   - Proceed to checkout
   - Fill shipping information
   - Select payment method
   - Complete payment

3. **Test Authentication:**
   - Sign in with Clerk
   - Verify user session
   - Test guest checkout

## Common Issues and Solutions

### Issue 1: Email Notifications Not Working
**Solution:**
1. Verify Resend API key is set correctly
2. Check Supabase function logs
3. Ensure email addresses are valid

### Issue 2: Payment Processing Errors
**Solution:**
1. Check browser console for errors
2. Verify Supabase function is deployed
3. Check network connectivity

### Issue 3: Authentication Issues
**Solution:**
1. Verify Clerk configuration
2. Check domain settings in Clerk dashboard
3. Ensure proper redirect URLs

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase functions deployed
- [ ] Email notifications tested
- [ ] Payment flow tested
- [ ] Authentication working
- [ ] Database migrations applied
- [ ] SSL certificate configured (for production)
- [ ] Domain configured in Clerk dashboard 