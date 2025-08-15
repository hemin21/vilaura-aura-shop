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

    // Send email notification via EmailJS - much simpler!
    try {
      console.log('📧 Sending email notification via EmailJS...');
      
      const customerName = guest_name || `${shipping_address.firstName || ''} ${shipping_address.lastName || ''}`.trim();
      const orderItemsText = itemsWithNames.map(item => 
        `${item.name} - Qty: ${item.quantity} - ₹${item.price.toFixed(2)}`
      ).join('\n');

      // EmailJS API call - direct HTTP request
      const emailData = {
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
        body: JSON.stringify(emailData)
      });

      if (emailResponse.ok) {
        console.log('✅ Email sent successfully via EmailJS!');
        console.log('📧 Emails sent to: aksharthakkar774@gmail.com, hjdunofficial21@gmail.com, vilaura.official@gmail.com');
      } else {
        const errorText = await emailResponse.text();
        console.error('❌ EmailJS failed:', errorText);
      }
    } catch (emailError) {
      console.error('❌ Failed to send email via EmailJS:', emailError);
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