const https = require('https');

console.log('🚀 Testing Direct Email System\n');

// Your Resend API key
const RESEND_API_KEY = 're_Q67CzZjf_LHhQvcyLWxEPF62xsUCfX4Ni';

// Test order data
const testOrderData = {
  order_number: 'TEST-001',
  total_amount: '299.00',
  customer_name: 'Test Customer',
  customer_email: 'test@example.com',
  customer_phone: '+91 9876543210',
  shipping_address: '123 Test Street, Mumbai, Maharashtra 400001',
  items: [
    { name: 'Lavender Soap', quantity: 2, price: '149.50' },
    { name: 'Rose Soap', quantity: 1, price: '199.00' }
  ]
};

// Create email HTML
const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
  <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 30px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">VilĀura</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Natural Artisan Soaps & Skincare</p>
    <div style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
      <h2 style="margin: 0; font-size: 20px;">🛍️ Order Confirmed!</h2>
      <p style="margin: 5px 0; font-size: 14px;">Order #${testOrderData.order_number}</p>
    </div>
  </div>
  
  <div style="padding: 30px;">
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Summary</h3>
      <p style="margin: 5px 0;"><strong>Order Number:</strong> ${testOrderData.order_number}</p>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
      <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${testOrderData.total_amount}</p>
      <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: bold;">Paid</span></p>
    </div>

    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Customer Information</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${testOrderData.customer_name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${testOrderData.customer_email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${testOrderData.customer_phone}</p>
    </div>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #856404;">Shipping Address</h3>
      <p style="margin: 5px 0;">${testOrderData.shipping_address}</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
      <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Items</h3>
      ${testOrderData.items.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
          <div>
            <p style="margin: 0; font-weight: bold;">${item.name}</p>
            <p style="margin: 0; font-size: 14px; color: #6c757d;">Quantity: ${item.quantity}</p>
          </div>
          <p style="margin: 0; font-weight: bold;">₹${item.price}</p>
        </div>
      `).join('')}
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px solid #dee2e6; margin-top: 10px;">
        <p style="margin: 0; font-weight: bold; font-size: 18px;">Total</p>
        <p style="margin: 0; font-weight: bold; font-size: 18px; color: #8B5CF6;">₹${testOrderData.total_amount}</p>
      </div>
    </div>

    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #6c757d; font-size: 14px;">
        Thank you for choosing VilĀura! Your order is being processed and will be shipped soon.
      </p>
    </div>
  </div>
</div>
`;

// Email data
const emailData = {
  from: "VilĀura Orders <onboarding@resend.dev>",
  to: [
    "aksharthakkar774@gmail.com",
    "hjdunofficial21@gmail.com", 
    "vilaura.official@gmail.com"
  ],
  subject: `🛍️ Test Order Confirmed - ${testOrderData.order_number} - ₹${testOrderData.total_amount}`,
  html: emailHtml
};

console.log('📧 Sending test email...');
console.log('✅ From:', emailData.from);
console.log('✅ To:', emailData.to.join(', '));
console.log('✅ Subject:', emailData.subject);

// Send email using Resend API
const postData = JSON.stringify(emailData);

const options = {
  hostname: 'api.resend.com',
  port: 443,
  path: '/emails',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📧 Email Response:');
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n🎉 SUCCESS! Email sent to all 3 addresses!');
      console.log('📧 Check these Gmail accounts:');
      console.log('   - aksharthakkar774@gmail.com');
      console.log('   - hjdunofficial21@gmail.com');
      console.log('   - vilaura.official@gmail.com');
      console.log('\n💡 Check spam folder if not received immediately');
    } else {
      console.log('\n❌ Email sending failed');
      console.log('Please check your Resend API key');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending email:', error);
});

req.write(postData);
req.end();

console.log('\n⏳ Sending email... Please wait...'); 