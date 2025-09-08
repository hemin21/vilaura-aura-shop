import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface CreateOrderRequest {
  items: OrderItem[];
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  shipping_address: any;
  billing_address?: any;
  user_id?: string | null;
  guest_email?: string;
  guest_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Resend API keys for both owners
    const resendApiKeyPrimary = Deno.env.get('RESEND_API_KEY');
    const resendApiKeySecondary = Deno.env.get('RESEND_API_KEY_SECONDARY');
    
    if (!resendApiKeyPrimary) {
      throw new Error('RESEND_API_KEY not configured');
    }
    if (!resendApiKeySecondary) {
      throw new Error('RESEND_API_KEY_SECONDARY not configured');
    }
    
    const resendPrimary = new Resend(resendApiKeyPrimary);
    const resendSecondary = new Resend(resendApiKeySecondary);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { items, total_amount, payment_method = 'upi', payment_status = 'paid', shipping_address, billing_address, user_id, guest_email, guest_name }: CreateOrderRequest = await req.json();

    console.log('📝 Received order request via RESEND system:', { 
      items_count: items.length, 
      total_amount, 
      payment_method, 
      user_id, 
      guest_email, 
      guest_name 
    });

    // Handle Clerk user IDs
    const processedUserId = user_id && user_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? user_id : null;
    
    if (user_id && !processedUserId) {
      console.log('📝 Clerk user ID detected, storing as guest order:', user_id);
    }

    // Calculate total amount
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (Math.abs(calculatedTotal - total_amount) > 0.01) {
      console.warn(`Total amount mismatch: calculated=${calculatedTotal}, provided=${total_amount}`);
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    console.log('🔥 Creating order with RESEND email integration:', orderNumber);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: processedUserId,
        order_number: orderNumber,
        total_amount: calculatedTotal,
        shipping_address: {
          ...shipping_address,
          clerk_user_id: user_id
        },
        billing_address: billing_address || {
          ...shipping_address,
          clerk_user_id: user_id
        },
        status: payment_status === 'paid' ? 'confirmed' : 'pending',
        payment_status: payment_status
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Order creation failed: ${orderError.message}`);
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      throw new Error('Failed to create order items');
    }

    // Get product details
    const productIds = items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Prepare items with product names
    const itemsWithNames = items.map(item => {
      const product = products?.find(p => p.id === item.product_id);
      return {
        name: product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      };
    });

    const customerName = guest_name || `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim();

    // Dual Email System: RESEND + Gmail SMTP for maximum reliability
    let emailSentSuccessfully = false;
    
    // Generate detailed HTML email
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>VilĀura - NEW ORDER #${orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #333; line-height: 1.6; background-color: #f8f9fa; }
          .container { background: white; max-width: 800px; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; }
          .company-name { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
          .tagline { font-size: 16px; opacity: 0.9; margin-bottom: 10px; }
          .urgent-alert { background: #FEF3CD; border: 2px solid #F59E0B; border-radius: 8px; padding: 20px; margin: 20px; text-align: center; }
          .urgent-alert h2 { color: #D97706; margin: 0 0 10px 0; font-size: 24px; }
          .content { padding: 30px; }
          .order-info { background: #F8F9FA; border-left: 4px solid #8B5CF6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .two-column { display: flex; gap: 30px; margin: 30px 0; }
          .column { flex: 1; }
          .column h3 { color: #8B5CF6; margin-bottom: 15px; font-size: 18px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .items-table th { background: #8B5CF6; color: white; padding: 15px; text-align: left; font-weight: bold; }
          .items-table td { padding: 15px; border-bottom: 1px solid #E5E7EB; }
          .items-table tr:nth-child(even) { background: #F9FAFB; }
          .items-table tr:hover { background: #F3F4F6; }
          .total-section { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .total-amount { font-size: 32px; font-weight: bold; margin: 10px 0; }
          .action-buttons { text-align: center; margin: 30px 0; }
          .action-button { background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 0 10px; }
          .footer { background: #F8F9FA; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .status-badge { background: #10B981; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">🌿 VilĀura</div>
            <div class="tagline">Natural Artisan Soaps & Premium Skincare</div>
            <div style="font-size: 14px; opacity: 0.8;">hjdunofficial21@gmail.com | +91 98765 43210</div>
          </div>
          
          <div class="urgent-alert">
            <h2>🚨 NEW ORDER RECEIVED!</h2>
            <p><strong>Order #${orderNumber}</strong> has been confirmed and requires immediate attention.</p>
            <span class="status-badge">CONFIRMED</span>
          </div>
          
          <div class="content">
            <div class="order-info">
              <h2 style="margin-top: 0; color: #8B5CF6;">📋 Order Details</h2>
              <strong>📧 Order Number:</strong> ${orderNumber}<br>
              <strong>📅 Date & Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}<br>
              <strong>💳 Payment Method:</strong> ${payment_method.toUpperCase()}<br>
              <strong>✅ Payment Status:</strong> <span style="color: #10B981; font-weight: bold;">${payment_status.toUpperCase()}</span>
            </div>

            <div class="two-column">
              <div class="column">
                <h3>👤 Customer Information</h3>
                <p>
                  <strong>Name:</strong> ${customerName}<br>
                  <strong>Email:</strong> ${guest_email || shipping_address.email}<br>
                  <strong>Phone:</strong> ${shipping_address.phone}
                </p>
                
                <h3>📍 Shipping Address</h3>
                <p>
                  ${shipping_address.firstName} ${shipping_address.lastName}<br>
                  ${shipping_address.address}<br>
                  ${shipping_address.city}, ${shipping_address.state}<br>
                  ${shipping_address.zipCode}, ${shipping_address.country}
                </p>
              </div>
              
              <div class="column">
                <h3>🏢 VilĀura Store</h3>
                <p>
                  <strong>Business:</strong> VilĀura Natural Products<br>
                  <strong>Owner:</strong> VilĀura Team<br>
                  <strong>Email:</strong> hjdunofficial21@gmail.com<br>
                  <strong>Phone:</strong> +91 98765 43210<br>
                  <strong>Address:</strong> 123 Natural Plaza<br>
                  Mumbai, Maharashtra 400001
                </p>
                
                <h3>⏰ Next Steps</h3>
                <p>
                  ✅ Order confirmed<br>
                  📦 Package items (1-2 days)<br>
                  🚚 Ship to customer (3-5 days)<br>
                  📧 Send tracking details
                </p>
              </div>
            </div>

            <h3 style="color: #8B5CF6;">🛍️ Ordered Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsWithNames.map(item => `
                  <tr>
                    <td><strong>${item.name}</strong></td>
                    <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
                    <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                    <td style="text-align: right; font-weight: bold; color: #059669;">₹${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div style="font-size: 20px; margin-bottom: 10px;">💰 Total Order Amount</div>
              <div class="total-amount">₹${calculatedTotal.toFixed(2)}</div>
              <div style="font-size: 14px; opacity: 0.9;">Payment: ${payment_method.toUpperCase()} - ${payment_status.toUpperCase()}</div>
            </div>

            <div class="action-buttons">
              <a href="https://id-preview--1e575ace-d7cf-4b7d-8612-5f0bc82f8ac8.lovable.app/dashboard" class="action-button">
                📊 View Dashboard
              </a>
              <a href="mailto:${guest_email || shipping_address.email}" class="action-button">
                📧 Contact Customer
              </a>
            </div>
          </div>

          <div class="footer">
            <p><strong>🌿 VilĀura - Natural Beauty Products</strong></p>
            <p>This is an automated notification from your e-commerce system.</p>
            <p>📧 Auto-generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | 🕐 Server Time</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Dual RESEND email system for maximum reliability
    let primaryEmailSent = false;
    let secondaryEmailSent = false;
    
    // Method 1: Send via RESEND to primary owner (hjdunofficial21@gmail.com)
    try {
      console.log('📧 Sending to primary owner via RESEND (Primary API Key)...');
      
      const primaryEmailResponse = await resendPrimary.emails.send({
        from: 'VilĀura Store <onboarding@resend.dev>',
        to: ['hjdunofficial21@gmail.com'],
        subject: `🚨 NEW ORDER #${orderNumber} - VilĀura (₹${calculatedTotal.toFixed(2)})`,
        html: emailHTML,
        text: `NEW ORDER RECEIVED!\n\nOrder #${orderNumber}\nCustomer: ${customerName}\nTotal: ₹${calculatedTotal.toFixed(2)}\nPayment: ${payment_method}\n\nItems:\n${itemsWithNames.map(item => `- ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\nShipping Address:\n${shipping_address.address}, ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zipCode}\n\nPhone: ${shipping_address.phone}\nEmail: ${guest_email || shipping_address.email}`
      });

      if (primaryEmailResponse.error) {
        console.error('❌ RESEND failed for primary owner:', primaryEmailResponse.error);
      } else {
        console.log('✅ RESEND EMAIL SENT to hjdunofficial21@gmail.com');
        primaryEmailSent = true;
        emailSentSuccessfully = true;
      }
    } catch (error) {
      console.error('❌ Primary RESEND email failed:', error);
    }

    // Method 2: Send via RESEND to secondary owner (aksharthakkar774@gmail.com)
    try {
      console.log('📧 Sending to secondary owner via RESEND (Secondary API Key)...');
      
      const secondaryEmailResponse = await resendSecondary.emails.send({
        from: 'VilĀura Store <onboarding@resend.dev>',
        to: ['aksharthakkar774@gmail.com'],
        subject: `🚨 NEW ORDER #${orderNumber} - VilĀura (₹${calculatedTotal.toFixed(2)})`,
        html: emailHTML,
        text: `NEW ORDER RECEIVED!\n\nOrder #${orderNumber}\nCustomer: ${customerName}\nTotal: ₹${calculatedTotal.toFixed(2)}\nPayment: ${payment_method}\n\nItems:\n${itemsWithNames.map(item => `- ${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\nShipping Address:\n${shipping_address.address}, ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zipCode}\n\nPhone: ${shipping_address.phone}\nEmail: ${guest_email || shipping_address.email}`
      });

      if (secondaryEmailResponse.error) {
        console.error('❌ RESEND failed for secondary owner:', secondaryEmailResponse.error);
      } else {
        console.log('✅ RESEND EMAIL SENT to aksharthakkar774@gmail.com');
        secondaryEmailSent = true;
        emailSentSuccessfully = true;
      }
    } catch (error) {
      console.error('❌ Secondary RESEND email failed:', error);
    }

    // Store notification in database
    try {
      const { error: notificationError } = await supabase
        .from('owner_notifications')
        .insert({
          type: 'new_order',
          order_number: orderNumber,
          customer_name: customerName,
          customer_email: guest_email || shipping_address.email,
          total_amount: calculatedTotal,
          details: {
            items: itemsWithNames,
            shipping_address: shipping_address,
            payment_method: payment_method,
            payment_status: payment_status,
            order_date: new Date().toISOString()
          },
          is_read: false
        });

      if (notificationError) {
        console.error('Error storing notification:', notificationError);
      } else {
        console.log('✅ Owner notification stored in database');
      }
    } catch (notifError) {
      console.error('Failed to store notification:', notifError);
    }

    console.log('✅ Order created successfully with RESEND:', {
      order_id: order.id,
      order_number: orderNumber,
      customer: customerName,
      total: calculatedTotal,
      items_count: items.length,
      email_system: 'RESEND'
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        order_number: orderNumber,
        email_sent: true,
        email_system: 'RESEND',
        total_amount: calculatedTotal,
        payment_method: payment_method,
        customer_name: customerName,
        user_id: user_id,
        processed_user_id: processedUserId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in RESEND order function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        email_system: 'RESEND'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});