import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/validation';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

const MockPayment: React.FC = () => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');

  // Redirect if cart is empty or user not logged in
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleMockPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order via Supabase function
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          items: orderItems,
          total_amount: totalPrice,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
          shipping_address: JSON.parse(localStorage.getItem('shipping_info') || '{}'),
          billing_address: JSON.parse(localStorage.getItem('shipping_info') || '{}')
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Order placed successfully!",
          description: `Order #${data.order_number} has been created. ${paymentMethod === 'cod' ? 'You will pay on delivery.' : 'Payment successful!'}`,
        });
        clearCart();
        localStorage.removeItem('shipping_info');
        navigate('/order-success', { state: { orderNumber: data.order_number, paymentMethod } });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Payment</h1>
            <p className="text-muted-foreground">Choose your preferred payment method</p>
          </div>

          {/* Order Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>All payments are simulated for demo purposes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* UPI Payment */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">UPI</span>
                    </div>
                    <div>
                      <p className="font-medium">UPI Payment</p>
                      <p className="text-sm text-muted-foreground">PhonePe, Google Pay, BHIM UPI</p>
                    </div>
                  </div>
                  {paymentMethod === 'upi' && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>

              {/* Card Payment */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-10 h-10 text-blue-600" />
                    <div>
                      <p className="font-medium">Debit/Credit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                  {paymentMethod === 'card' && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>

              {/* Cash on Delivery */}
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">₹</span>
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive</p>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demo Notice */}
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">DEMO</Badge>
                <div>
                  <p className="font-medium text-amber-800">Demo Payment Mode</p>
                  <p className="text-sm text-amber-700">
                    This is a demonstration. No real money will be charged. 
                    All transactions are simulated for testing purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <Button 
            onClick={handleMockPayment} 
            className="w-full h-14 text-lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatPrice(totalPrice)}`}
              </>
            )}
          </Button>

          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/checkout')}
              disabled={isProcessing}
            >
              ← Back to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;