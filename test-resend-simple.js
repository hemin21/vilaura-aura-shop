// Simple Resend Test
// Paste this in your browser console when on your website

const testResendEmail = async () => {
  try {
    console.log('🧪 Testing Resend email delivery...');
    
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: {
        orderNumber: 'TEST-RESEND-EMAIL',
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
      console.log('❌ Resend test failed:', error);
      return false;
    }

    console.log('✅ Resend test successful!');
    console.log('📧 Email should be sent to: aksharthakkar774@gmail.com, vilaura.official@gmail.com');
    console.log('📋 Response:', data);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run the test
testResendEmail();