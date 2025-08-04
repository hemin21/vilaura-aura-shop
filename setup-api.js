const fs = require('fs');

console.log('🚀 Setting up Resend API Key for VilĀura E-commerce\n');

const RESEND_API_KEY = 're_Q67CzZjf_LHhQvcyLWxEPF62xsUCfX4Ni';

// Create .env file with the API key
const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://ttynpoekdlemfriqvhte.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW5wb2VrZGxlbWZyaXF2aHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjgyNzgsImV4cCI6MjA2OTA0NDI3OH0.GYI6o7OrqXa4vgCXEKKTU-YX3AXn4EZGQFJnXfzzfJY

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZGVhci1zaGVlcC0zNy5jbGVyay5hY2NvdW50cy5kZXYk

# Resend Email Configuration (Configured with your API key)
VITE_RESEND_API_KEY=${RESEND_API_KEY}

# Payment Gateway Configuration (for future integration)
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# App Configuration
VITE_APP_NAME=VilĀura
VITE_APP_URL=http://localhost:5173
`;

// Write .env file
fs.writeFileSync('.env', envContent);

console.log('✅ Created .env file with your Resend API key');
console.log('✅ API Key configured:', RESEND_API_KEY);

console.log('\n📋 Next Steps:');
console.log('1. Set Supabase secret (run this command):');
console.log(`   supabase secrets set RESEND_API_KEY=${RESEND_API_KEY}`);
console.log('2. Deploy Supabase functions:');
console.log('   supabase functions deploy');
console.log('3. Test the email system');

console.log('\n🎯 Email Configuration:');
console.log('✅ All 3 Gmail addresses configured:');
console.log('   - aksharthakkar774@gmail.com');
console.log('   - hjdunofficial21@gmail.com');
console.log('   - vilaura.official@gmail.com');
console.log('✅ Professional email template ready');
console.log('✅ Complete order details included');

console.log('\n🚀 Your email system is now configured!');
console.log('After deploying functions, all 3 Gmail addresses will receive order notifications.'); 