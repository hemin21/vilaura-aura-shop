#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up VilĀura E-commerce Environment Variables\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists. Backing up to .env.backup');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
}

// Create .env file with template
const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://ttynpoekdlemfriqvhte.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eW5wb2VrZGxlbWZyaXF2aHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjgyNzgsImV4cCI6MjA2OTA0NDI3OH0.GYI6o7OrqXa4vgCXEKKTU-YX3AXn4EZGQFJnXfzzfJY

# Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZGVhci1zaGVlcC0zNy5jbGVyay5hY2NvdW50cy5kZXYk

# Resend Email Configuration (Required for email notifications)
# Get your API key from https://resend.com
VITE_RESEND_API_KEY=your-resend-api-key-here

# Payment Gateway Configuration (for future integration)
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# App Configuration
VITE_APP_NAME=VilĀura
VITE_APP_URL=http://localhost:5173
`;

fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env file with template values');
console.log('\n📋 Next Steps:');
console.log('1. Get your Resend API key from https://resend.com');
console.log('2. Update VITE_RESEND_API_KEY in the .env file');
console.log('3. Set the Resend API key in Supabase:');
console.log('   supabase secrets set RESEND_API_KEY=your-api-key-here');
console.log('4. Deploy Supabase functions:');
console.log('   supabase functions deploy');
console.log('\n🎉 Your VilĀura e-commerce store is ready!'); 