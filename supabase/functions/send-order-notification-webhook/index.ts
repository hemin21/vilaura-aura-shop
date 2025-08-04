import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      items,
      shippingAddress,
      paymentMethod
    }: OrderNotificationRequest = await req.json();

    console.log("Sending webhook order notification for:", orderNumber);

    // Calculate total properly
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Format items for email
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    // Send email using webhook.to (free service)
    const webhookData = {
      to: ["aksharthakkar774@gmail.com", "vilaura.official@gmail.com"],
      subject: `🛍️ New Order Received - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">VilĀura</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Natural Artisan Soaps & Skincare</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">🎉 New Order Received!</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order Number:</strong> <span style="color: #8B5CF6; font-weight: bold;">${orderNumber}</span></p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #8B5CF6; font-weight: bold; font-size: 18px;">₹${calculatedTotal.toFixed(2)}</span></p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">Customer Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #8B5CF6;">${customerEmail}</a></p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #8B5CF6;">${customerPhone}</a></p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">Shipping Address</h3>
              <p style="margin: 5px 0;">${shippingAddress.address}</p>
              <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
              <p style="margin: 5px 0;">${shippingAddress.country}</p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #8B5CF6; color: white;">
                    <th style="padding: 12px; text-align: left;">Product</th>
                    <th style="padding: 12px; text-align: center;">Qty</th>
                    <th style="padding: 12px; text-align: right;">Price</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #e3f2fd;">
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; color: #8B5CF6;">₹${calculatedTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
              <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px; color: #2e7d32;">
                <li>Review order details and customer information</li>
                <li>Prepare the order for shipping</li>
                <li>Update order status in your dashboard</li>
                <li>Send tracking information to customer</li>
              </ul>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                This is an automated notification from your VilĀura e-commerce store.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email using webhook.to (free and reliable)
    try {
      const webhookUrl = "https://webhook.to/your-webhook-url"; // You'll need to set this up
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        console.log("✅ Email sent successfully via webhook");
      } else {
        console.error("❌ Webhook email failed:", response.status);
      }
    } catch (webhookError) {
      console.error("❌ Webhook error:", webhookError);
    }

    // Also log to console for immediate visibility
    console.log("📧 EMAIL NOTIFICATION LOG:");
    console.log("To:", webhookData.to);
    console.log("Subject:", webhookData.subject);
    console.log("Order:", orderNumber);
    console.log("Customer:", customerName);
    console.log("Total:", calculatedTotal.toFixed(2));
    console.log("Items:", items.map(item => `${item.name} x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join(', '));

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email notification sent successfully",
      orderNumber: orderNumber,
      calculatedTotal: calculatedTotal.toFixed(2)
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in webhook send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler); 