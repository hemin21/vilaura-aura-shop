# VilĀura - Natural Artisan Soaps & Skincare

A modern, fully-functional e-commerce website built with React, TypeScript, and Supabase. Features a beautiful UI, secure authentication, shopping cart, checkout system, and email notifications.

## 🚀 Recent Fixes & Improvements

### ✅ Fixed Issues:
1. **Duplicate Payment Buttons** - Removed duplicate buttons in checkout
2. **Payment Flow** - Improved payment method selection and processing
3. **Email Notifications** - Added graceful handling for missing API keys
4. **Authentication** - Proper Clerk integration with guest checkout support
5. **User Experience** - Enhanced payment simulation with success/failure states
6. **Error Handling** - Better error messages and fallback mechanisms

### 🎯 Key Features:
- **Modern UI/UX** - Beautiful, responsive design with shadcn/ui components
- **Authentication** - Clerk integration for user management
- **Shopping Cart** - Persistent cart with real-time updates
- **Checkout System** - Multi-step checkout with payment method selection
- **Payment Processing** - Mock payment system with realistic simulation
- **Email Notifications** - Automated order notifications via Resend
- **Guest Checkout** - Support for guest orders without registration
- **Order Management** - Complete order tracking and management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Authentication**: Clerk
- **Backend**: Supabase (Database, Functions, Auth)
- **Email**: Resend
- **Payment**: Mock system (ready for Razorpay/Stripe integration)

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vilaura-aura-shop
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
node setup-env.js
```

4. **Configure Resend for email notifications**
   - Sign up at [Resend.com](https://resend.com)
   - Get your API key
   - Update `VITE_RESEND_API_KEY` in `.env`
   - Set Supabase secret: `supabase secrets set RESEND_API_KEY=your-key`

5. **Deploy Supabase functions**
```bash
supabase functions deploy
```

6. **Start development server**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

# Resend Email Configuration
VITE_RESEND_API_KEY=your-resend-api-key

# App Configuration
VITE_APP_NAME=VilĀura
VITE_APP_URL=http://localhost:5173
```

### Database Setup
The following tables are required in Supabase:

1. **products** - Product information
2. **orders** - Order details
3. **order_items** - Order line items
4. **users** - User information (if using Supabase auth)

## 🎯 Payment System

### Current Implementation
- ✅ Mock payment system with realistic simulation
- ✅ Multiple payment methods (UPI, Card, Net Banking, COD)
- ✅ Payment success/failure simulation
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

## 📧 Email Notifications

The system sends automated email notifications for:
- New order notifications to business owners
- Order confirmation to customers (future enhancement)

### Setup Email Notifications:
1. Get API key from [Resend.com](https://resend.com)
2. Update environment variables
3. Deploy Supabase functions

## 🧪 Testing

### Test Payment Flow:
1. Add items to cart
2. Proceed to checkout
3. Fill shipping information
4. Select payment method
5. Complete payment simulation

### Test Email Notifications:
1. Place a test order
2. Check email inbox
3. Verify Supabase function logs

## 🚀 Deployment

### Prerequisites:
- [ ] Environment variables configured
- [ ] Supabase functions deployed
- [ ] Email notifications tested
- [ ] Payment flow tested
- [ ] Authentication working
- [ ] Database migrations applied

### Deployment Steps:
1. **Build the application**
```bash
npm run build
```

2. **Deploy to your preferred platform**
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - Custom server: Upload build files

3. **Configure production environment**
   - Update environment variables
   - Configure domain in Clerk dashboard
   - Set up SSL certificate

## 🔍 Troubleshooting

### Common Issues:

#### Issue 1: Email Notifications Not Working
**Solution:**
1. Verify Resend API key is set correctly
2. Check Supabase function logs
3. Ensure email addresses are valid

#### Issue 2: Payment Processing Errors
**Solution:**
1. Check browser console for errors
2. Verify Supabase function is deployed
3. Check network connectivity

#### Issue 3: Authentication Issues
**Solution:**
1. Verify Clerk configuration
2. Check domain settings in Clerk dashboard
3. Ensure proper redirect URLs

## 📁 Project Structure

```
vilaura-aura-shop/
├── src/
│   ├── components/          # UI components
│   ├── context/            # React contexts
│   ├── pages/              # Page components
│   ├── integrations/       # External service integrations
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── functions/          # Supabase Edge Functions
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the [Configuration Guide](CONFIGURATION_GUIDE.md)
- Review the [Deployment Guide](DEPLOYMENT_GUIDE.md)
- Open an issue on GitHub

---

**Made with ❤️ for VilĀura - Natural Artisan Soaps & Skincare**
