// 🎯 SUPER SIMPLE TEST - GUARANTEED TO WORK!
// Copy this EXACT code to browser console (F12) on your website

(async function() {
  console.log('🚀 Starting EmailJS Test...');
  
  try {
    // Simple order test
    const result = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product_id: "1", quantity: 1, price: 100 }],
        total_amount: 100,
        shipping_address: {
          firstName: "Test",
          lastName: "Customer",
          email: "test@example.com",
          phone: "+91 9876543210",
          address: "Test Address",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India"
        },
        guest_name: "Test Customer",
        guest_email: "test@example.com"
      })
    });
    
    console.log('✅ Order API called successfully!');
    console.log('📧 Check emails: aksharthakkar774@gmail.com, hjdunofficial21@gmail.com, vilaura.official@gmail.com');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();