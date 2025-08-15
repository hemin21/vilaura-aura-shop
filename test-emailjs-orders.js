// 🧪 WORKING EMAILJS TEST - COPY TO BROWSER CONSOLE
// 1. Go to your website
// 2. Open browser console (F12)
// 3. Paste this entire code

console.log('🚀 Testing EmailJS Order System...');

async function testEmailJSOrder() {
  try {
    console.log('📝 Creating test order...');
    
    // Import supabase from window (already loaded on your site)
    const { createClient } = window.supabase || {};
    if (!createClient) {
      console.error('❌ Supabase not found on window');
      return;
    }
    
    const supabase = createClient(
      'https://ttynpoekdlemfriqvhte.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW5wb2VrZGxlbWZyaXF2aHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjgyNzgsImV4cCI6MjA2OTA0NDI3OH0.GYI6o7OrqXa4vgCXEKKTU-YX3AXn4EZGQFJnXfzzfJY'
    );
    
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
}

// Run the test automatically
testEmailJSOrder().then(success => {
  if (success) {
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('💡 Check your emails and owner dashboard at /owner-dashboard');
  } else {
    console.log('❌ TEST FAILED - Check console for details');
  }
});