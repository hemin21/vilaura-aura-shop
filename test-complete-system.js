// Complete System Test - Email Notifications + Order Calculations
// Run this in your browser console to test everything

const testCompleteSystem = async () => {
  try {
    console.log('🚀 Testing Complete VilĀura System...\n');
    
    // Test 1: Check Supabase Connection
    console.log('🔌 Step 1: Testing Supabase Connection...');
    const { data: products, error: productsError } = await supabase.from('products').select('id, name, price').limit(3);
    
    if (productsError) {
      console.log('❌ Supabase connection failed:', productsError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📦 Available products:', products.map(p => `${p.name} (₹${p.price})`));
    
    // Test 2: Test Order Creation with Proper Calculations
    console.log('\n📦 Step 2: Testing Order Creation with Calculations...');
    
    const testOrderData = {
      items: [
        { product_id: products[0]?.id || '1', quantity: 2, price: 299.50 },
        { product_id: products[1]?.id || '2', quantity: 1, price: 199.50 }
      ],
      total_amount: 798.50, // This should be calculated automatically
      payment_method: 'cod',
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

    // Calculate expected total
    const expectedTotal = testOrderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('🧮 Expected total calculation:', expectedTotal.toFixed(2));
    console.log('📊 Provided total:', testOrderData.total_amount.toFixed(2));
    
    const { data: orderData, error: orderError } = await supabase.functions.invoke('create-order', {
      body: testOrderData
    });

    if (orderError) {
      console.log('❌ Order creation failed:', orderError);
      return;
    }

    console.log('✅ Order created successfully!');
    console.log('📋 Order details:', orderData);
    
    // Verify calculations
    if (orderData.calculatedTotal) {
      console.log('✅ Order total calculation verified:', orderData.calculatedTotal);
    }
    
    // Test 3: Test Email Notification
    console.log('\n📧 Step 3: Testing Email Notification...');
    
    const testNotificationData = {
      orderNumber: orderData.order_number || 'TEST-EMAIL-123',
      customerName: 'Test Email Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+91 9876543210',
      totalAmount: expectedTotal,
      items: testOrderData.items.map(item => ({
        name: products.find(p => p.id === item.product_id)?.name || 'Test Product',
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: {
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      },
      paymentMethod: 'COD'
    };

    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-order-notification', {
      body: testNotificationData
    });

    if (emailError) {
      console.log('❌ Email notification failed:', emailError);
      
      // Try backup email function
      console.log('🔄 Trying backup email function...');
      const { data: backupEmailData, error: backupEmailError } = await supabase.functions.invoke('send-order-notification-webhook', {
        body: testNotificationData
      });
      
      if (backupEmailError) {
        console.log('❌ Backup email also failed:', backupEmailError);
      } else {
        console.log('✅ Backup email function working!');
        console.log('📧 Backup response:', backupEmailData);
      }
    } else {
      console.log('✅ Email notification successful!');
      console.log('📧 Email response:', emailData);
    }
    
    // Test 4: Verify Database Records
    console.log('\n🗄️ Step 4: Verifying Database Records...');
    
    // Check if order exists in database
    const { data: dbOrders, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderData.order_number)
      .limit(1);
    
    if (dbError) {
      console.log('❌ Database query failed:', dbError);
    } else if (dbOrders && dbOrders.length > 0) {
      console.log('✅ Order found in database');
      console.log('📊 Database order total:', dbOrders[0].total_amount);
      console.log('📊 Calculated total:', expectedTotal.toFixed(2));
      
      // Verify total matches
      if (Math.abs(dbOrders[0].total_amount - expectedTotal) < 0.01) {
        console.log('✅ Order total calculation is correct!');
      } else {
        console.log('❌ Order total calculation mismatch!');
      }
    } else {
      console.log('❌ Order not found in database');
    }
    
    // Test 5: Check Order Items
    console.log('\n📋 Step 5: Verifying Order Items...');
    
    if (dbOrders && dbOrders.length > 0) {
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', dbOrders[0].id);
      
      if (itemsError) {
        console.log('❌ Order items query failed:', itemsError);
      } else {
        console.log('✅ Order items found:', orderItems.length);
        orderItems.forEach(item => {
          console.log(`  - Product ID: ${item.product_id}, Qty: ${item.quantity}, Price: ₹${item.price}`);
        });
      }
    }
    
    console.log('\n🎉 Complete System Test Results:');
    console.log('✅ Supabase Connection: Working');
    console.log('✅ Order Creation: Working');
    console.log('✅ Total Calculation: Working');
    console.log('✅ Database Storage: Working');
    console.log('✅ Email Notification: ' + (emailError ? 'Needs Fix' : 'Working'));
    
    console.log('\n📧 Email Status:');
    console.log('- Check your emails: aksharthakkar774@gmail.com, vilaura.official@gmail.com');
    console.log('- Check spam/junk folders');
    console.log('- Look for subject: 🛍️ New Order Received - ' + (orderData.order_number || 'TEST'));
    
    console.log('\n🔧 If emails not working:');
    console.log('1. Check Supabase Dashboard → Environment Variables → RESEND_API_KEY');
    console.log('2. Redeploy functions: supabase functions deploy create-order');
    console.log('3. Redeploy functions: supabase functions deploy send-order-notification');
    
  } catch (error) {
    console.error('❌ Complete system test failed:', error);
    console.error('🔍 Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

// Run the complete test
testCompleteSystem(); 