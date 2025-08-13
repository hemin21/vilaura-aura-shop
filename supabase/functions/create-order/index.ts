import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Resend only if API key is available
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    // Send email notification to all 3 Gmail addresses (only if Resend is configured)
    if (resend && resendApiKey) {
      try {
        const customerName = guest_name || `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim();
        const currentDate = new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        await resend.emails.send({
          from: "VilĀura Orders <onboarding@resend.dev>",
          to: [
            "aksharthakkar774@gmail.com",
            "hjdunofficial21@gmail.com", 
            "vilaura.official@gmail.com"
          ],
          subject: `🛍️ New Order Confirmed - ${orderNumber} - ₹${calculatedTotal.toFixed(2)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 40px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 32px; font-weight: bold;">VilĀura</h1>
                <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Natural Artisan Soaps & Skincare</p>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
                  <h2 style="margin: 0; font-size: 24px;">🎉 Order Confirmed!</h2>
                  <p style="margin: 5px 0; font-size: 16px;">Payment received successfully</p>
                </div>
              </div>
              
              <!-- Main Content -->
              <div style="padding: 40px;">
                <!-- Order Summary -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #8B5CF6;">
                  <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px;">📋 Order Summary</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Order Number:</p>
                      <p style="margin: 5px 0; color: #8B5CF6; font-size: 18px; font-weight: bold;">${orderNumber}</p>
                    </div>
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Order Date:</p>
                      <p style="margin: 5px 0; color: #495057;">${currentDate}</p>
                    </div>
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Payment Method:</p>
                      <p style="margin: 5px 0; color: #495057; text-transform: capitalize;">${payment_method}</p>
                    </div>
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Total Amount:</p>
                      <p style="margin: 5px 0; color: #8B5CF6; font-size: 20px; font-weight: bold;">₹${calculatedTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <!-- Customer Information -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px;">👤 Customer Information</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Customer Name:</p>
                      <p style="margin: 5px 0; color: #495057;">${customerName}</p>
                    </div>
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Email:</p>
                      <p style="margin: 5px 0;"><a href="mailto:${guest_email || shipping_address.email}" style="color: #8B5CF6; text-decoration: none;">${guest_email || shipping_address.email}</a></p>
                    </div>
                    <div>
                      <p style="margin: 5px 0; font-weight: bold; color: #495057;">Phone:</p>
                      <p style="margin: 5px 0;"><a href="tel:${shipping_address.phone}" style="color: #8B5CF6; text-decoration: none;">${shipping_address.phone}</a></p>
                    </div>
                     <div>
                       <p style="margin: 5px 0; font-weight: bold; color: #495057;">Order Type:</p>
                       <p style="margin: 5px 0; color: #495057;">${user_id ? `Authenticated User (${user_id})` : 'Guest Order'}</p>
                     </div>
                     <div>
                       <p style="margin: 5px 0; font-weight: bold; color: #495057;">User ID:</p>
                       <p style="margin: 5px 0; color: #495057; font-family: monospace; font-size: 12px;">${user_id || 'Guest'}</p>
                     </div>
                  </div>
                </div>

                <!-- Shipping Address -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px;">📍 Shipping Address</h3>
                  <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
                    <p style="margin: 5px 0; font-weight: bold; color: #495057;">${shipping_address.firstName} ${shipping_address.lastName}</p>
                    <p style="margin: 5px 0; color: #495057;">${shipping_address.address}</p>
                    <p style="margin: 5px 0; color: #495057;">${shipping_address.city}, ${shipping_address.state} ${shipping_address.zipCode}</p>
                    <p style="margin: 5px 0; color: #495057;">${shipping_address.country}</p>
                  </div>
                </div>

                <!-- Order Items -->
                <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px;">🛍️ Order Items</h3>
                  <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background: #8B5CF6; color: white;">
                        <th style="padding: 15px; text-align: left; font-weight: 600;">Product</th>
                        <th style="padding: 15px; text-align: center; font-weight: 600;">Quantity</th>
                        <th style="padding: 15px; text-align: right; font-weight: 600;">Price</th>
                        <th style="padding: 15px; text-align: right; font-weight: 600;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsWithNames.map(item => `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                          <td style="padding: 15px; color: #495057; font-weight: 500;">${item.name}</td>
                          <td style="padding: 15px; text-align: center; color: #495057;">${item.quantity}</td>
                          <td style="padding: 15px; text-align: right; color: #495057;">₹${item.price.toFixed(2)}</td>
                          <td style="padding: 15px; text-align: right; color: #495057; font-weight: 500;">₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                    <tfoot>
                      <tr style="background: #e3f2fd;">
                        <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; color: #2c3e50;">Total:</td>
                        <td style="padding: 15px; text-align: right; font-weight: bold; color: #8B5CF6; font-size: 18px;">₹${calculatedTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <!-- Action Steps -->
                <div style="background: #e8f5e8; padding: 25px; border-radius: 12px; border-left: 4px solid #4caf50; margin-bottom: 30px;">
                  <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 20px;">✅ Next Steps</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #2e7d32; line-height: 1.6;">
                    <li>Review order details and customer information</li>
                    <li>Prepare the order for shipping</li>
                    <li>Update order status in your dashboard</li>
                    <li>Send tracking information to customer</li>
                    <li>Process payment and update inventory</li>
                  </ul>
                </div>

                <!-- Footer -->
                <div style="margin-top: 30px; padding: 25px; background: #f8f9fa; border-radius: 12px; text-align: center;">
                  <p style="margin: 0; color: #6c757d; font-size: 14px;">
                    This is an automated notification from your VilĀura e-commerce store.
                  </p>
                  <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">
                    Order ID: ${order.id} | Generated: ${new Date().toISOString()}
                  </p>
                </div>
              </div>
            </div>
          `,
        });

        console.log('Order notification email sent successfully to all 3 addresses');
      } catch (emailError) {
        console.error('Error sending order notification email:', emailError);
        // Don't fail the order creation if email fails
      }
    } else {
      console.warn('Resend API key not configured. Email notifications disabled.');
      console.log('To enable email notifications, set the RESEND_API_KEY environment variable.');
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
        email_sent: !!resend && !!resendApiKey,
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