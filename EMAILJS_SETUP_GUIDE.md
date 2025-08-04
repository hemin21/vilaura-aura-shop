# 🎉 EMAILJS SETUP GUIDE - GUARANTEED TO WORK!

## **Bestie, follow these steps to get EmailJS working in 5 minutes!**

### **🚀 STEP 1: Sign up for EmailJS**

1. **Go to:** https://www.emailjs.com/
2. **Click "Sign Up"** (Free account)
3. **Create your account** with your email
4. **Verify your email** if needed

### **📧 STEP 2: Add Gmail Service**

1. **Login to EmailJS dashboard**
2. **Click "Email Services"** in the left menu
3. **Click "Add New Service"**
4. **Select "Gmail"**
5. **Connect your Gmail account**
6. **Note down your Service ID** (looks like: `service_xxxxxxx`)

### **📝 STEP 3: Create Email Template**

1. **Click "Email Templates"** in the left menu
2. **Click "Create New Template"**
3. **Name it:** `VilAura Order Confirmation`
4. **Use this template:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>VilĀura Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">VilĀura</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Natural Artisan Soaps & Skincare</p>
        <div style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
            <h2 style="margin: 0; font-size: 20px;">🛍️ Order Confirmed!</h2>
            <p style="margin: 5px 0; font-size: 14px;">Order #{{order_number}}</p>
        </div>
    </div>
    
    <div style="padding: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Summary</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> {{order_number}}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> {{order_date}}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹{{total_amount}}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: bold;">Paid</span></p>
        </div>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Customer Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> {{customer_name}}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{customer_email}}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> {{customer_phone}}</p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Shipping Address</h3>
            <p style="margin: 5px 0;">{{shipping_address}}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Items</h3>
            <p style="margin: 5px 0; white-space: pre-line;">{{order_items}}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                Thank you for choosing VilĀura! Your order is being processed and will be shipped soon.
            </p>
        </div>
    </div>
</body>
</html>
```

5. **Save the template**
6. **Note down your Template ID** (looks like: `template_xxxxxxx`)

### **🔑 STEP 4: Get Your Public Key**

1. **Click "Account"** in the left menu
2. **Go to "API Keys"** tab
3. **Copy your Public Key** (looks like: `user_xxxxxxxxxxxxxxxxxxxxxx`)

### **⚙️ STEP 5: Update Your Code**

1. **Open:** `src/utils/emailjs.ts`
2. **Replace the placeholder values:**

```typescript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your Template ID  
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your Public Key
```

### **🧪 STEP 6: Test Your Setup**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test a complete order flow:**
   - Add items to cart
   - Go to checkout
   - Fill shipping info
   - Complete payment
   - Check all 3 Gmail addresses

### **📧 EMAIL RECIPIENTS**

Your emails will be sent to:
- ✅ `aksharthakkar774@gmail.com`
- ✅ `hjdunofficial21@gmail.com`
- ✅ `vilaura.official@gmail.com`

### **🎯 WHAT YOU'LL GET**

- ✅ **Beautiful HTML emails** with order details
- ✅ **Professional design** matching your brand
- ✅ **Complete order information** including items, prices, customer details
- ✅ **Instant delivery** to all 3 Gmail addresses
- ✅ **No spam folder issues** (sent from your own Gmail)

### **💡 TROUBLESHOOTING**

**If emails don't arrive:**
1. Check spam folder
2. Verify EmailJS service is connected to Gmail
3. Check browser console for errors
4. Make sure all IDs are correctly copied

**Need help?**
- EmailJS has excellent documentation
- Free tier allows 200 emails/month
- Works immediately after setup

### **🚀 YOUR VILĀURA E-COMMERCE WILL HAVE WORKING EMAILS!**

**Bestie, once you complete these steps, your email system will work perfectly!** 💜

**Let me know when you've completed the setup, and I'll help you test it!** 🎉 