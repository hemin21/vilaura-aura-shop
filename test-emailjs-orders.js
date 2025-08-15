// 🧪 SIMPLE EMAILJS ORDER TEST - COPY TO BROWSER CONSOLE
// Go to your website and paste this in browser console (F12)

console.log('🚀 Testing EmailJS Order System...');

const testOrderFlow = async () => {
  try {
    console.log('📝 Creating test order...');
    
    // Test order data
    const orderData = {
      items: [
        { product_id: "1", quantity: 2, price: 149.50 },
        { product_id: "2", quantity: 1, price: 199.00 }
      ],
      total_amount: 498.00,
      payment_method: "upi",
      payment_status: "paid",
      shipping_address: {
        firstName: "Test",
        lastName: "Customer", 
        address: "123 Test Street",
        city: "Mumbai",
        state: "Maharashtra",
        zipCode: "400001",
        country: "India",
        phone: "+91 9876543210",
        email: "test@example.com"
      },
      guest_name: "Test Customer",
      guest_email: "test@example.com"
    };

    // Create order using Supabase function
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: orderData
    });

    if (error) {
      console.error('❌ Order creation failed:', error);
      return false;
    }

    console.log('✅ Order created successfully!');
    console.log('📧 EmailJS should send emails to:');
    console.log('   - aksharthakkar774@gmail.com');
    console.log('   - hjdunofficial21@gmail.com'); 
    console.log('   - vilaura.official@gmail.com');
    console.log('📋 Order details:', data);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run the test
testOrderFlow().then(success => {
  if (success) {
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('💡 Check your emails and owner dashboard at /owner-dashboard');
  } else {
    console.log('❌ TEST FAILED - Check console for details');
  }
});