# 🚀 Email Notification System Deployment Guide

## What We've Built
✅ **Order Notification System** - You'll receive email notifications at `aksharthakkar774@gmail.com` and `vilaura.official@gmail.com` whenever someone places an order

## 📋 Deployment Steps

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your VilĀura project: `ttynpoekdlemfriqvhte`

### Step 2: Deploy the Updated Functions

#### Option A: Manual Upload (Recommended)
1. In your Supabase dashboard, go to **Edge Functions**
2. Find the `create-order` function
3. Click **Edit** or **Update**
4. Copy the entire content from `supabase/functions/create-order/index.ts`
5. Paste it into the function editor
6. Click **Deploy**

#### Option B: Using Supabase CLI (Alternative)
```bash
# Install Supabase CLI (run PowerShell as Administrator)
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the functions
supabase functions deploy create-order
supabase functions deploy send-order-notification
```

### Step 3: Verify Email Configuration
1. In Supabase dashboard, go to **Settings** → **API**
2. Check that your **RESEND_API_KEY** is set in Environment Variables
3. If not, add it in **Settings** → **Edge Functions** → **Environment Variables**

### Step 4: Test the System
1. Go to your website
2. Add items to cart
3. Complete checkout process
4. Check your emails: `aksharthakkar774@gmail.com` and `vilaura.official@gmail.com`

## 🎯 What You'll Receive

Every order will trigger an email with:
- 📧 **Subject**: "🛍️ New Order Received - [Order Number]"
- 👤 **Customer Details**: Name, email, phone
- 📍 **Shipping Address**: Complete delivery information
- 🛒 **Order Items**: Product names, quantities, prices
- 💰 **Total Amount**: Order total in INR
- 💳 **Payment Method**: How customer paid
- 📋 **Next Steps**: What you need to do

## 🔧 Troubleshooting

### If emails aren't sending:
1. Check Supabase dashboard → **Edge Functions** → **Logs**
2. Verify RESEND_API_KEY is set correctly
3. Check your spam folder

### If orders aren't creating:
1. Check browser console for errors
2. Verify user authentication is working
3. Check Supabase database tables exist

## 📞 Support
If you encounter any issues, the error logs will be in your Supabase dashboard under **Edge Functions** → **Logs**.

---

**🎉 You're all set!** Once deployed, you'll receive instant email notifications for every order placed on your VilĀura shop. 