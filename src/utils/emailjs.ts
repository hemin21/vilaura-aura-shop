import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_6ya4r19'; // You'll get this from EmailJS dashboard
const EMAILJS_TEMPLATE_ID = 'template_2wpde8b'; // You'll get this from EmailJS dashboard
const EMAILJS_PUBLIC_KEY = 'xhg0ooMMPVNWY55Rl'; // You'll get this from EmailJS dashboard

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

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

export const sendOrderEmail = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    console.log('📧 Sending email via EmailJS for order:', orderData.order_number);
    
    // Individual email addresses for better error handling
    const emailAddresses = [
      'aksharthakkar774@gmail.com',
      'hjdunofficial21@gmail.com', 
      'vilaura.official@gmail.com'
    ];
    
    let successCount = 0;
    let failureCount = 0;
    
    // Try to send to each email individually
    for (const email of emailAddresses) {
      try {
        console.log(`📧 Attempting to send to: ${email}`);
        
        // Prepare email template parameters for individual email
        const templateParams = {
          to_email: email,
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

        // Send email using EmailJS
        const result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        console.log(`✅ Email sent successfully to ${email}:`, result);
        successCount++;
        
      } catch (error: any) {
        console.error(`❌ Failed to send email to ${email}:`, error);
        failureCount++;
        
        // Log specific error details
        if (error.text) {
          console.error(`Error text for ${email}:`, error.text);
        }
        if (error.status) {
          console.error(`Error status for ${email}:`, error.status);
        }
      }
    }
    
    // Return true if at least one email was sent successfully
    if (successCount > 0) {
      console.log(`🎉 Email sending completed: ${successCount} successful, ${failureCount} failed`);
      return true;
    } else {
      console.log('❌ All email attempts failed');
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ General error in sendOrderEmail:', error);
    return false;
  }
};

// Test function to verify EmailJS setup
export const testEmailJS = async (): Promise<boolean> => {
  try {
    const testData: OrderEmailData = {
      order_number: 'TEST-EMAILJS-001',
      total_amount: '299.00',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '+91 9876543210',
      shipping_address: '123 Test Street, Mumbai, Maharashtra 400001',
      items: [
        { name: 'Lavender Soap', quantity: 2, price: '149.50' },
        { name: 'Rose Soap', quantity: 1, price: '199.00' }
      ]
    };

    return await sendOrderEmail(testData);
  } catch (error) {
    console.error('❌ EmailJS test failed:', error);
    return false;
  }
}; 