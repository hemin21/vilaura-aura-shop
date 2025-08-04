// Check Resend API configuration
// Run this in your browser console to verify email setup

const checkResendConfiguration = async () => {
  try {
    console.log('🔍 Checking Resend API configuration...');
    
    // Test if we can access the function
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderNumber: 'TEST-RESEND-CHECK',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '+91 9876543210',
        totalAmount: 100.00,
        items: [{ name: 'Test Product', quantity: 1, price: 100.00 }],
        shippingAddress: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          zipCode: '123456',
          country: 'India'
        },
        paymentMethod: 'TEST'
      }
    });

    if (error) {
      console.log('❌ Resend configuration error:', error);
      
      if (error.message.includes('RESEND_API_KEY')) {
        console.log('🔧 SOLUTION: Set RESEND_API_KEY in Supabase Dashboard');
        console.log('📝 Steps:');
        console.log('1. Go to Supabase Dashboard');
        console.log('2. Navigate to Settings → Environment Variables');
        console.log('3. Add: RESEND_API_KEY=your_resend_api_key_here');
        console.log('4. Redeploy the function');
      }
      
      return false;
    }

    console.log('✅ Resend configuration is working!');
    console.log('📧 Email should be sent to: aksharthakkar774@gmail.com, vilaura.official@gmail.com');
    console.log('📋 Response:', data);
    
    return true;
  } catch (error) {
    console.error('❌ Configuration check failed:', error);
    return false;
  }
};

// Run the check
checkResendConfiguration(); 