# Supabase Functions Deployment Guide

## Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref ttynpoekdlemfriqvhte`

## Environment Variables
Make sure these environment variables are set in your Supabase project:

```bash
RESEND_API_KEY=your_resend_api_key_here
SUPABASE_URL=https://ttynpoekdlemfriqvhte.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Deploy Functions

### 1. Deploy create-order function
```bash
supabase functions deploy create-order
```

### 2. Deploy send-order-notification function
```bash
supabase functions deploy send-order-notification
```

### 3. Deploy send-contact-email function
```bash
supabase functions deploy send-contact-email
```

## Test Functions

### Test Order Creation
```bash
supabase functions invoke create-order --body '{
  "items": [{"product_id": "1", "quantity": 1, "price": 299.50}],
  "total_amount": 299.50,
  "shipping_address": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+91 9876543210",
    "address": "123 Test St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}'
```

### Test Email Notification
```bash
supabase functions invoke send-order-notification --body '{
  "orderNumber": "TEST-123",
  "customerName": "Test Customer",
  "customerEmail": "test@example.com",
  "customerPhone": "+91 9876543210",
  "totalAmount": 299.50,
  "items": [{"name": "Test Product", "quantity": 1, "price": 299.50}],
  "shippingAddress": {
    "address": "123 Test St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "paymentMethod": "UPI"
}'
```

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure CORS headers are properly set in functions
2. **Authentication errors**: Verify API keys and environment variables
3. **Email not sending**: Check Resend API key and email configuration
4. **Function not found**: Ensure functions are deployed to the correct project

### Check Function Logs:
```bash
supabase functions logs create-order
supabase functions logs send-order-notification
```

### Verify Environment Variables:
```bash
supabase secrets list
```

## Email Configuration
- **From email**: onboarding@resend.dev (for testing)
- **To emails**: aksharthakkar774@gmail.com, vilaura.official@gmail.com
- **Subject**: 🛍️ New Order Received - {orderNumber}

## Database Requirements
Make sure these tables exist:
- `orders` - for storing order information
- `order_items` - for storing order line items
- `products` - for product information 