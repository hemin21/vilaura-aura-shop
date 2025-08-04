const fs = require('fs');

console.log('🚀 Creating .env file with your Resend API key...\n');

const RESEND_API_KEY = 're_Q67CzZjf_LHhQvcyLWxEPF62xsUCfX4Ni';

const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://ttynpoekdlemfriqvhte.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW5wb2VrZGxlbWZyaXF2aHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjgyNzgsImV4cCI6MjA2OTA0NDI3OH0.GYI6o7OrqXa4vgCXEKKTU-YX3AXn4EZGQFJnXfzzfJY

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZGVhci1zaGVlcC0zNy5jbGVyay5hY2NvdW50cy5kZXYk

# Resend Email Configuration (Your API Key)
VITE_RESEND_API_KEY=${RESEND_API_KEY}

# Payment Gateway Configuration (for future integration)
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# App Configuration
VITE_APP_NAME=VilĀura
VITE_APP_URL=http://localhost:8080
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Successfully created .env file!');
  console.log('✅ Your Resend API key is configured:', RESEND_API_KEY);
} catch (error) {
  console.log('❌ Error creating .env file:', error.message);
}

console.log('\n📋 Next steps:');
console.log('1. Restart your development server');
console.log('2. Test the email system');
console.log('3. Check Supabase function logs');

console.log('\n🎯 Your email system will send to:');
console.log('   - aksharthakkar774@gmail.com');
console.log('   - hjdunofficial21@gmail.com');
console.log('   - vilaura.official@gmail.com'); 