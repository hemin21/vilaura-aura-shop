const https = require('https');

console.log('🔍 TESTING EMAILJS CONNECTIVITY\n');

// Your EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_6ya4r19';
const EMAILJS_TEMPLATE_ID = 'template_2wpde8b';
const EMAILJS_PUBLIC_KEY = 'xhg0ooMMPVNWY55Rl';

console.log('📧 EmailJS Configuration:');
console.log('✅ Service ID:', EMAILJS_SERVICE_ID);
console.log('✅ Template ID:', EMAILJS_TEMPLATE_ID);
console.log('✅ Public Key:', EMAILJS_PUBLIC_KEY);

// Test data
const testData = {
  service_id: EMAILJS_SERVICE_ID,
  template_id: EMAILJS_TEMPLATE_ID,
  user_id: EMAILJS_PUBLIC_KEY,
  template_params: {
    to_email: 'aksharthakkar774@gmail.com, hjdunofficial21@gmail.com, vilaura.official@gmail.com',
    order_number: 'TEST-CONNECTIVITY-001',
    total_amount: '299.00',
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '+91 9876543210',
    shipping_address: '123 Test Street, Mumbai, Maharashtra 400001',
    order_items: 'Lavender Soap - Qty: 2 - ₹149.50\nRose Soap - Qty: 1 - ₹199.00',
    order_date: new Date().toLocaleDateString('en-IN'),
    message: 'Test connectivity from VilĀura e-commerce'
  }
};

console.log('\n🧪 Testing EmailJS API connectivity...');

// Test EmailJS API endpoint
const postData = JSON.stringify(testData);

const options = {
  hostname: 'api.emailjs.com',
  port: 443,
  path: '/api/v1.0/email/send',
  method: 'POST',
  headers: {
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
    console.log('\n📧 EmailJS API Response:');
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('\n🎉 SUCCESS! EmailJS connectivity is working!');
      console.log('✅ Your EmailJS configuration is correct');
      console.log('✅ API is responding properly');
      console.log('✅ Emails should be sent successfully');
    } else if (res.statusCode === 400) {
      console.log('\n⚠️  CONFIGURATION ISSUE:');
      console.log('❌ Service ID, Template ID, or Public Key might be incorrect');
      console.log('❌ Check your EmailJS dashboard configuration');
      console.log('❌ Verify the template exists and is properly configured');
    } else if (res.statusCode === 401) {
      console.log('\n❌ AUTHENTICATION ERROR:');
      console.log('❌ Public Key is invalid or expired');
      console.log('❌ Check your EmailJS API key');
    } else {
      console.log('\n❌ UNKNOWN ERROR:');
      console.log('❌ Something went wrong with the EmailJS service');
      console.log('❌ Check EmailJS service status');
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ NETWORK ERROR:', error.message);
  console.log('❌ Cannot connect to EmailJS API');
  console.log('❌ Check your internet connection');
});

req.write(postData);
req.end();

console.log('\n⏳ Testing connectivity... Please wait...'); 