// Backup email solution using webhook
export interface OrderEmailData {
  order_number: string;
  total_amount: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
}

export const sendOrderEmailBackup = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('📧 Sending email via backup method for order:', orderData.order_number);
    
    // Email addresses
    const emailAddresses = [
      'aksharthakkar774@gmail.com',
      'hjdunofficial21@gmail.com', 
      'vilaura.official@gmail.com'
    ];
    
    // Create email content
    const emailContent = `
🛍️ NEW ORDER CONFIRMED - VilĀura

Order Number: ${orderData.order_number}
Order Date: ${new Date().toLocaleDateString('en-IN')}
Total Amount: ₹${orderData.total_amount}

👤 Customer Information:
Name: ${orderData.customer_name}
Email: ${orderData.customer_email}
Phone: ${orderData.customer_phone}
Address: ${orderData.shipping_address}

📦 Order Items:
${orderData.items.map(item => 
  `• ${item.name} - Qty: ${item.quantity} - ₹${item.price}`
).join('\n')}

---
VilĀura - Natural Artisan Soaps & Skincare
Thank you for your order! 🧼✨
    `;
    
    // Use a simple webhook service (you can replace this with your preferred service)
    const webhookUrl = 'https://webhook.site/your-webhook-url'; // Replace with your webhook
    
    const webhookData = {
      to: emailAddresses.join(', '),
      subject: `🛍️ New Order Confirmed - ${orderData.order_number} - ₹${orderData.total_amount}`,
      body: emailContent,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      total_amount: orderData.total_amount
    };
    
    // Send webhook (this is a placeholder - you'll need to set up a real webhook service)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });
    
    if (response.ok) {
      console.log('✅ Backup email sent successfully');
      return true;
    } else {
      console.log('❌ Backup email failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Backup email error:', error);
    return false;
  }
};

// Simple email using EmailJS with better error handling
export const sendSimpleEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('📧 Sending simple email for order:', orderData.order_number);
    
    // Import EmailJS dynamically to avoid SSR issues
    const emailjs = await import('@emailjs/browser');
    
    // EmailJS Configuration
    const EMAILJS_SERVICE_ID = 'service_6ya4r19';
    const EMAILJS_TEMPLATE_ID = 'template_2wpde8b';
    const EMAILJS_PUBLIC_KEY = 'xhg0ooMMPVNWY55Rl';
    
    // Initialize EmailJS
    emailjs.default.init(EMAILJS_PUBLIC_KEY);
    
    // Simple template parameters
    const templateParams = {
      to_email: 'aksharthakkar774@gmail.com, hjdunofficial21@gmail.com, vilaura.official@gmail.com',
      order_number: orderData.order_number,
      total_amount: orderData.total_amount,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      order_items: orderData.items.map(item => 
        `${item.name} - Qty: ${item.quantity} - ₹${item.price}`
      ).join('\n'),
      order_date: new Date().toLocaleDateString('en-IN'),
      message: `New order received from ${orderData.customer_name} for ₹${orderData.total_amount}`
    };
    
    // Send email
    const result = await emailjs.default.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('✅ Simple email sent successfully:', result);
    return true;
    
  } catch (error: any) {
    console.error('❌ Simple email error:', error);
    
    // Log specific error details
    if (error.text) {
      console.error('Error text:', error.text);
    }
    if (error.status) {
      console.error('Error status:', error.status);
    }
    
    return false;
  }
}; 