// Test script to verify email notification system
// Run this in your browser console after deployment

const testOrderCreationAndNotification = async () => {
  try {
    console.log('🧪 Testing complete order creation and email notification system...');
    
    // Check if Supabase client is available
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not found. Make sure you\'re running this in the browser console.');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Test data for order creation
    const testOrderData = {
      items: [
        { product_id: '1', quantity: 2, price: 299.50 },
        { product_id: '2', quantity: 1, price: 299.50 }
      ],
      total_amount: 898.50,
      payment_method: 'UPI',
      payment_status: 'paid',
      shipping_address: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      billing_address: {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      user_id: null,
      guest_email: 'test@example.com',
      guest_name: 'Test Customer'
    };

    console.log('📦 Creating test order...');
    
    // Test order creation (this should trigger email notification)
    const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
      body: testOrderData
    });

    if (orderError) {
      console.log('❌ Order creation failed:', orderError);
      console.log('🔍 Error details:', {
        message: orderError.message,
        status: orderError.status,
        statusText: orderError.statusText
      });
      return;
    }

    console.log('✅ Order created successfully!');
    console.log('📋 Order details:', orderData);
    
    // Test standalone email notification
    console.log('📧 Testing standalone email notification...');
    
    const testNotificationData = {
      orderNumber: 'TEST-NOTIFICATION-123',
      customerName: 'Test Notification Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      totalAmount: 599.00,
      items: [
        { name: 'Lavender Soap', quantity: 2, price: 299.50 },
        { name: 'Rose Soap', quantity: 1, price: 299.50 }
      ],
      shippingAddress: {
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      paymentMethod: 'UPI'
    };

    const { data: notificationData, error: notificationError } = await supabase.functions.invoke('send-order-notification', {
      body: testNotificationData
    });

    if (notificationError) {
      console.log('❌ Standalone email notification failed:', notificationError);
      console.log('🔍 Error details:', {
        message: notificationError.message,
        status: notificationError.status,
        statusText: notificationError.statusText
      });
    } else {
      console.log('✅ Standalone email notification successful!');
      console.log('📧 Response:', notificationData);
    }
    
    console.log('🎉 Test completed!');
    console.log('📧 Check your emails: aksharthakkar774@gmail.com, vilaura.official@gmail.com');
    
    // Additional validation
    console.log('🔍 Additional checks:');
    console.log('- Verify functions are deployed: Check Supabase Dashboard → Edge Functions');
    console.log('- Check environment variables: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    console.log('- Verify email configuration: Check Resend dashboard for email delivery status');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('🔍 Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

// Helper function to test individual components
const testSupabaseConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('products').select('id, name').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📦 Sample product:', data[0]);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

const testFunctionAvailability = async () => {
  try {
    console.log('🔧 Testing function availability...');
    
    // Test if functions are accessible
    const { data, error } = await supabase.functions.invoke('create-order', {
      body: { test: true }
    });
    
    if (error && error.message.includes('Function not found')) {
      console.log('❌ Functions not deployed. Please deploy them first.');
      return false;
    }
    
    console.log('✅ Functions are accessible');
    return true;
  } catch (error) {
    console.log('❌ Function test failed:', error);
    return false;
  }
};

// Run comprehensive tests
const runAllTests = async () => {
  console.log('🚀 Starting comprehensive email notification system tests...\n');
  
  // Test 1: Supabase connection
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('❌ Stopping tests due to connection failure');
    return;
  }
  
  console.log('');
  
  // Test 2: Function availability
  const functionsOk = await testFunctionAvailability();
  if (!functionsOk) {
    console.log('❌ Stopping tests due to function unavailability');
    return;
  }
  
  console.log('');
  
  // Test 3: Full order and notification test
  await testOrderCreationAndNotification();
};

// Run the comprehensive test
runAllTests(); 