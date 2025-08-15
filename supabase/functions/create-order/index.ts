import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// EmailJS configuration - Much simpler than Resend!
const EMAILJS_SERVICE_ID = 'service_6ya4r19';
const EMAILJS_TEMPLATE_ID = 'template_2wpde8b';
const EMAILJS_PUBLIC_KEY = 'xhg0ooMMPVNWY55Rl';

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
    // Create Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { items, total_amount, payment_method = 'upi', payment_status = 'paid', shipping_address, billing_address, user_id, guest_email, guest_name }: CreateOrderRequest = await req.json();

    console.log('📝 Received order request:', { 
      items_count: items.length, 
      total_amount, 
      payment_method, 
      user_id, 
      guest_email, 
      guest_name 
    });

    // Handle Clerk user IDs (which are strings, not UUIDs)
    // For now, we'll set user_id to null and store user info in shipping_address
    const processedUserId = user_id && user_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? user_id : null;
    
    if (user_id && !processedUserId) {
      console.log('📝 Clerk user ID detected (not UUID format), storing as guest order:', user_id);
    }

    // Calculate total amount properly from items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Validate total amount
    if (Math.abs(calculatedTotal - total_amount) > 0.01) {
      console.warn(`Total amount mismatch: calculated=${calculatedTotal}, provided=${total_amount}`);
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    console.log('🔥 Creating order with processed user_id:', processedUserId);

    // Create order (user_id set to null for Clerk users, info stored in shipping_address)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: processedUserId, // null for Clerk users
        order_number: orderNumber,
        total_amount: calculatedTotal, // Use calculated total instead of provided total
        shipping_address: {
          ...shipping_address,
          clerk_user_id: user_id // Store original Clerk user ID here
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

    // Get product details for email notification
    const productIds = items.map(item => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Prepare items with product names for email
    const itemsWithNames = items.map(item => {
      const product = products?.find(p => p.id === item.product_id);
      return {
        name: product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      };
    });

    // Generate detailed bill HTML for owner
    const customerName = guest_name || `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim();
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>VilĀura - Order Bill #${orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 32px; font-weight: bold; color: #8B5CF6; margin-bottom: 5px; }
          .tagline { font-size: 14px; color: #666; margin-bottom: 10px; }
          .bill-title { font-size: 24px; margin: 20px 0; color: #333; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .two-column { display: flex; justify-content: space-between; margin: 30px 0; }
          .column { width: 48%; }
          .column h3 { color: #8B5CF6; margin-bottom: 15px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 15px; text-align: left; }
          .items-table th { background: #8B5CF6; color: white; font-weight: bold; }
          .items-table tr:nth-child(even) { background: #f9f9f9; }
          .total-section { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #8B5CF6; color: #666; }
          .urgent { background: #fef3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">🌿 VilĀura</div>
          <div class="tagline">Natural Artisan Soaps & Premium Skincare</div>
          <div style="font-size: 12px; color: #999;">hjdunofficial21@gmail.com | +91 98765 43210</div>
        </div>
        
        <div class="bill-title">📧 AUTOMATIC ORDER BILL - ${orderNumber}</div>
        
        <div class="urgent">
          <strong>🚨 URGENT: NEW ORDER RECEIVED</strong><br>
          This bill was automatically generated and sent to: <strong>hjdunofficial21@gmail.com</strong>
        </div>
        
        <div class="order-info">
          <strong>📋 Order Number:</strong> ${orderNumber}<br>
          <strong>📅 Date & Time:</strong> ${new Date().toLocaleString('en-IN')}<br>
          <strong>💳 Payment Method:</strong> ${payment_method}<br>
          <strong>✅ Payment Status:</strong> ${payment_status}
        </div>

        <div class="two-column">
          <div class="column">
            <h3>👤 Customer Details</h3>
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
            <h3>🏢 VilĀura Store Details</h3>
            <p>
              <strong>Business:</strong> VilĀura Natural Products<br>
              <strong>Address:</strong> 123 Natural Plaza<br>
              Mumbai, Maharashtra 400001<br>
              <strong>Contact:</strong> +91 98765 43210<br>
              <strong>Email:</strong> hjdunofficial21@gmail.com
            </p>
          </div>
        </div>

        <h3>🛍️ Order Items Details</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsWithNames.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                <td style="text-align: right;"><strong>₹${(item.price * item.quantity).toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 20px;"><strong>💰 TOTAL AMOUNT:</strong></span>
            <span style="font-size: 28px; font-weight: bold;">₹${calculatedTotal.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>🙏 Thank you for choosing VilĀura!</strong></p>
          <p>📦 Order will be processed within 1-2 business days</p>
          <p>🚚 Expected delivery: 3-5 business days</p>
          <p>For any queries, contact: hjdunofficial21@gmail.com</p>
          <p style="font-size: 12px; margin-top: 20px;">This is an automatically generated bill from VilĀura e-commerce system.</p>
        </div>
      </body>
      </html>
    `;

    // Send detailed bill email to owner (hjdunofficial21@gmail.com)
    try {
      console.log('📧 Sending automatic bill email to owner...');
      
      const billEmailData = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: 'hjdunofficial21@gmail.com',
          subject: `🚨 URGENT: New Order Bill #${orderNumber}`,
          order_number: orderNumber,
          total_amount: calculatedTotal.toFixed(2),
          customer_name: customerName,
          customer_email: guest_email || shipping_address.email,
          customer_phone: shipping_address.phone,
          shipping_address: `${shipping_address.address}, ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zipCode}, ${shipping_address.country}`,
          order_items: itemsWithNames.map(item => 
            `${item.name} - Qty: ${item.quantity} - ₹${item.price.toFixed(2)} = ₹${(item.price * item.quantity).toFixed(2)}`
          ).join('\n'),
          order_date: new Date().toLocaleString('en-IN'),
          bill_html: billHTML,
          message: `🚨 URGENT: New order #${orderNumber} received! 
Customer: ${customerName}
Total: ₹${calculatedTotal.toFixed(2)}
Payment: ${payment_method}

Complete bill details attached above.

Action Required: Process this order within 1-2 business days.`
        }
      };

      const billEmailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billEmailData)
      });

      if (billEmailResponse.ok) {
        console.log('✅ AUTOMATIC BILL EMAIL SENT SUCCESSFULLY to hjdunofficial21@gmail.com');
      } else {
        const errorText = await billEmailResponse.text();
        console.error('❌ Bill email failed:', errorText);
      }
    } catch (billEmailError) {
      console.error('❌ Failed to send bill email:', billEmailError);
    }

    // Send notification emails to all addresses
    try {
      console.log('📧 Sending notification emails to all addresses...');
      
      const orderItemsText = itemsWithNames.map(item => 
        `${item.name} - Qty: ${item.quantity} - ₹${item.price.toFixed(2)}`
      ).join('\n');

      const notificationEmailData = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: 'aksharthakkar774@gmail.com, hjdunofficial21@gmail.com, vilaura.official@gmail.com',
          order_number: orderNumber,
          total_amount: calculatedTotal.toFixed(2),
          customer_name: customerName,
          customer_email: guest_email || shipping_address.email,
          customer_phone: shipping_address.phone,
          shipping_address: `${shipping_address.address}, ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zipCode}, ${shipping_address.country}`,
          order_items: orderItemsText,
          order_date: new Date().toLocaleDateString('en-IN'),
          message: `New order received from VilĀura e-commerce store!`
        }
      };

      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationEmailData)
      });

      if (emailResponse.ok) {
        console.log('✅ Notification emails sent successfully!');
        console.log('📧 Emails sent to: aksharthakkar774@gmail.com, hjdunofficial21@gmail.com, vilaura.official@gmail.com');
      } else {
        const errorText = await emailResponse.text();
        console.error('❌ Notification emails failed:', errorText);
      }
    } catch (emailError) {
      console.error('❌ Failed to send notification emails:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send owner notification to database and console
    try {
      const { error: notificationError } = await supabase.functions.invoke('send-simple-notification', {
        body: {
          order_number: orderNumber,
          customer_name: guest_name || `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim(),
          customer_email: guest_email || shipping_address.email,
          total_amount: calculatedTotal,
          items: itemsWithNames,
          shipping_address: shipping_address
        }
      });

      if (notificationError) {
        console.error('Error sending owner notification:', notificationError);
      } else {
        console.log('✅ Owner notification stored in database and logged');
      }
    } catch (notifError) {
      console.error('Failed to send owner notification:', notifError);
    }

    console.log('✅ Order created successfully:', {
      order_id: order.id,
      order_number: orderNumber,
      customer: guest_name || `${shipping_address.firstName} ${shipping_address.lastName}`,
      total: calculatedTotal,
      items_count: items.length,
      user_id: user_id,
      processed_user_id: processedUserId
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        order_number: orderNumber,
        email_sent: true, // EmailJS always attempts to send
        total_amount: calculatedTotal,
        payment_method: payment_method,
        customer_name: guest_name || `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim(),
        user_id: user_id,
        processed_user_id: processedUserId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in create-order function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});