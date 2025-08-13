import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shipping_address: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_number, customer_name, customer_email, total_amount, items, shipping_address }: NotificationRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store notification in database for the owner to see
    const { error: notificationError } = await supabase
      .from('owner_notifications')
      .insert({
        type: 'new_order',
        order_number,
        customer_name,
        customer_email,
        total_amount,
        details: {
          items,
          shipping_address,
          created_at: new Date().toISOString()
        },
        is_read: false
      });

    if (notificationError) {
      console.error('Error storing notification:', notificationError);
    }

    // Try to send email via a simple email service (like EmailJS)
    console.log(`📧 New Order Notification: ${order_number}`);
    console.log(`👤 Customer: ${customer_name} (${customer_email})`);
    console.log(`💰 Total: ₹${total_amount}`);
    console.log(`📦 Items: ${items.length}`);
    console.log(`📍 Address: ${shipping_address.city}, ${shipping_address.state}`);

    // Send to webhook or external notification service
    const ownerEmail = "hjdunofficial21@gmail.com";
    
    // Format a simple text notification that can be used with any email service
    const notificationText = `
🛍️ NEW ORDER ALERT 🛍️

Order Number: ${order_number}
Customer: ${customer_name}
Email: ${customer_email}
Total: ₹${total_amount}

Items:
${items.map(item => `- ${item.name} x${item.quantity} (₹${item.price})`).join('\n')}

Shipping Address:
${shipping_address.firstName} ${shipping_address.lastName}
${shipping_address.address}
${shipping_address.city}, ${shipping_address.state} ${shipping_address.zipCode}
${shipping_address.phone}

Time: ${new Date().toLocaleString('en-IN')}
    `;

    console.log('📧 OWNER NOTIFICATION:');
    console.log(notificationText);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification logged successfully',
        owner_email: ownerEmail,
        notification_text: notificationText
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-simple-notification function:', error);
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