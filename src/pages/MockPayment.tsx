import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SignIn, useUser } from '@clerk/clerk-react';
import { formatPrice } from '@/utils/validation';
import { sendOrderEmail } from '@/utils/emailjs';
import { sendSimpleEmail } from '@/utils/email-backup';

const paymentOptions = [
  { 
    label: 'UPI Payment', 
    value: 'upi',
    description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm',
    icon: '📱'
  },
  { 
    label: 'Credit/Debit Card', 
    value: 'card',
    description: 'Pay using Visa, MasterCard, RuPay cards',
    icon: '💳'
  },
  { 
    label: 'Net Banking', 
    value: 'netbanking',
    description: 'Pay using your bank\'s net banking service',
    icon: '🏦'
  },
  { 
    label: 'Cash on Delivery', 
    value: 'cod',
    description: 'Pay when you receive your order',
    icon: '💰'
  },
];

const MockPayment: React.FC = () => {
  const { isSignedIn, user: clerkUser } = useUser();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('upi');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success' | 'failed'>('select');
  const [shippingInfo, setShippingInfo] = useState<any>(null);

  useEffect(() => {
    // Get shipping info from localStorage
    const savedShippingInfo = localStorage.getItem('shipping_info');
    if (savedShippingInfo) {
      setShippingInfo(JSON.parse(savedShippingInfo));
    }
  }, []);

  // If not signed in, show Clerk SignIn
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to continue</CardTitle>
          </CardHeader>
          <CardContent>
            <SignIn routing="hash" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If cart is empty, redirect to cart
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // If no shipping info, redirect to checkout
  if (!shippingInfo) {
    navigate('/checkout');
    return null;
  }

  const simulatePayment = async (method: string): Promise<boolean> => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate different success rates based on payment method
    const successRates = {
      'upi': 0.95,
      'card': 0.90,
      'netbanking': 0.85,
      'cod': 1.0 // COD always succeeds
    };
    
    const successRate = successRates[method as keyof typeof successRates] || 0.9;
    return Math.random() < successRate;
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStep('processing');
    
    try {
      console.log('Starting payment process...');
      console.log('Payment method:', selectedOption);
      console.log('Shipping info:', shippingInfo);
      
      // Simulate payment processing
      const paymentSuccess = await simulatePayment(selectedOption);
      
      if (!paymentSuccess) {
        setPaymentStep('failed');
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: 'Your payment was not successful. Please try again with a different method.',
        });
        return;
      }

      // Payment successful, create order via Supabase function
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      console.log('Creating order with items:', orderItems);
      console.log('Total price:', totalPrice);

      // Create order via Supabase function (includes automatic email notification)
      const { data: orderResult, error: orderError } = await supabase.functions.invoke('create-order', {
        body: {
          items: orderItems,
          total_amount: totalPrice,
          payment_method: selectedOption,
          payment_status: 'paid',
          shipping_address: shippingInfo,
          billing_address: shippingInfo,
          user_id: clerkUser?.id || null,
          guest_email: clerkUser?.emailAddresses?.[0]?.emailAddress || shippingInfo.email,
          guest_name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim()
        }
      });

      if (orderError) {
        console.error('Order creation failed:', orderError);
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', orderResult);
      
      // Check if email was sent
      const emailSuccess = orderResult?.email_sent || false;
      
      if (emailSuccess) {
        console.log('✅ Order confirmation email sent to hjdunofficial21@gmail.com and other addresses');
      } else {
        console.warn('⚠️ Email notification may have failed');
        
        // Fallback: Try EmailJS as backup
        const emailData = {
          order_number: orderResult?.order_number || `VIL-${Date.now()}`,
          total_amount: totalPrice.toString(),
          customer_name: `${shippingInfo.firstName || ''} ${shippingInfo.lastName || ''}`.trim(),
          customer_email: clerkUser?.emailAddresses?.[0]?.emailAddress || shippingInfo.email,
          customer_phone: shippingInfo.phone || '',
          shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price.toString()
          }))
        };
        
        console.log('Trying EmailJS as backup...');
        await sendOrderEmail(emailData);
      }
      
      // Order created successfully
      setPaymentStep('success');
      const orderNumber = orderResult?.order_number || `VIL-${Date.now()}`;
      
      // Store order details for the success page
      const orderDetails = {
        orderNumber: orderNumber,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: totalPrice,
        shippingInfo: shippingInfo,
        paymentMethod: selectedOption
      };
      
      localStorage.setItem('order_details', JSON.stringify(orderDetails));
      
      toast({
        title: 'Payment Successful!',
        description: `Order #${orderNumber} has been created. Email confirmation sent to hjdunofficial21@gmail.com and other addresses.`,
      });
      
      clearCart();
      localStorage.removeItem('shipping_info');
      
      // Redirect to success page after a short delay
      setTimeout(() => {
        navigate('/order-success', { 
          state: { orderDetails } 
        });
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStep('failed');
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: 'There was an error processing your payment. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStep('select');
    setSelectedOption('upi');
  };

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Processing Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-spin">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                Please wait while we process your payment...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <p className="text-muted-foreground">
                Your order has been placed successfully! Redirecting to order confirmation...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </div>
              <p className="text-muted-foreground">
                Your payment was not successful. Please try again with a different payment method.
              </p>
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/checkout')} className="w-full">
                  Back to Checkout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total Amount: {formatPrice(totalPrice)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentOptions.map(option => (
              <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={selectedOption === option.value}
                  onChange={() => setSelectedOption(option.value)}
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                </div>
              </label>
            ))}
            <Button
              className="w-full mt-6"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/checkout')}
            >
              Back to Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockPayment;