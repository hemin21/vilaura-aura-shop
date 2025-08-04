const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Resend
const resend = new Resend('re_Q67CzZjf_LHhQvcyLWxEPF62xsUCfX4Ni');

// Email sending endpoint
app.post('/send-order-email', async (req, res) => {
  try {
    const { orderData } = req.body;
    
    console.log('📧 Sending email for order:', orderData.order_number);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">VilĀura</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Natural Artisan Soaps & Skincare</p>
          <div style="margin-top: 15px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 8px;">
            <h2 style="margin: 0; font-size: 20px;">🛍️ Order Confirmed!</h2>
            <p style="margin: 5px 0; font-size: 14px;">Order #${orderData.order_number}</p>
          </div>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Summary</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderData.order_number}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderData.total_amount}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: bold;">Paid</span></p>
          </div>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #2e7d32;">Customer Information</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${orderData.customer_name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${orderData.customer_email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderData.customer_phone}</p>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Shipping Address</h3>
            <p style="margin: 5px 0;">${orderData.shipping_address}</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">Order Items</h3>
            ${orderData.items.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                <div>
                  <p style="margin: 0; font-weight: bold;">${item.name}</p>
                  <p style="margin: 0; font-size: 14px; color: #6c757d;">Quantity: ${item.quantity}</p>
                </div>
                <p style="margin: 0; font-weight: bold;">₹${item.price}</p>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-top: 2px solid #dee2e6; margin-top: 10px;">
              <p style="margin: 0; font-weight: bold; font-size: 18px;">Total</p>
              <p style="margin: 0; font-weight: bold; font-size: 18px; color: #8B5CF6;">₹${orderData.total_amount}</p>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Thank you for choosing VilĀura! Your order is being processed and will be shipped soon.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email to all 3 addresses
    const emailResult = await resend.emails.send({
      from: "VilĀura Orders <onboarding@resend.dev>",
      to: [
        "aksharthakkar774@gmail.com",
        "hjdunofficial21@gmail.com", 
        "vilaura.official@gmail.com"
      ],
      subject: `🛍️ New Order Confirmed - ${orderData.order_number} - ₹${orderData.total_amount}`,
      html: emailHtml
    });

    console.log('✅ Email sent successfully:', emailResult);
    res.json({ success: true, message: 'Email sent successfully', data: emailResult });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Email server is running!', status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on http://localhost:${PORT}`);
  console.log('📧 Ready to send emails to all 3 Gmail addresses!');
}); 