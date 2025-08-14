import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Home, Package } from 'lucide-react';
import { formatPrice } from '@/utils/validation';
import { useCart } from '@/context/CartContext';

interface OrderDetails {
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingInfo: any;
  paymentMethod: string;
}

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Get order details from localStorage or location state
    const savedOrderDetails = localStorage.getItem('order_details');
    if (savedOrderDetails && !orderDetails) {
      setOrderDetails(JSON.parse(savedOrderDetails));
      localStorage.removeItem('order_details'); // Clean up
    } else if (location.state?.orderDetails && !orderDetails) {
      setOrderDetails(location.state.orderDetails);
    }
    // Clear cart only once when order details are set
    if (orderDetails) {
      clearCart();
    }
  }, [clearCart, location.state, orderDetails]); // Fixed dependencies

  const downloadBill = () => {
    if (!orderDetails) return;
    
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>VilĀura - Order Bill</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 28px; font-weight: bold; color: #8B5CF6; margin-bottom: 5px; }
          .bill-title { font-size: 24px; margin: 20px 0; }
          .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .two-column { display: flex; justify-content: space-between; margin: 20px 0; }
          .column { width: 48%; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background: #8B5CF6; color: white; }
          .total-section { background: #8B5CF6; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">VilĀura</div>
          <div>Natural Artisan Soaps & Skincare</div>
        </div>
        
        <div class="bill-title">📧 ORDER CONFIRMATION & BILL</div>
        
        <div class="order-info">
          <strong>Order Number:</strong> ${orderDetails.orderNumber}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
          <strong>Payment Method:</strong> ${orderDetails.paymentMethod}
        </div>

        <div class="two-column">
          <div class="column">
            <h3>📍 Shipping Address</h3>
            <p>
              ${orderDetails.shippingInfo.firstName} ${orderDetails.shippingInfo.lastName}<br>
              ${orderDetails.shippingInfo.address}<br>
              ${orderDetails.shippingInfo.city}, ${orderDetails.shippingInfo.state}<br>
              ${orderDetails.shippingInfo.zipCode}<br>
              📞 ${orderDetails.shippingInfo.phone}<br>
              ✉️ ${orderDetails.shippingInfo.email}
            </p>
          </div>
          <div class="column">
            <h3>🏢 Company Details</h3>
            <p>
              VilĀura Natural Products<br>
              123 Natural Plaza<br>
              Mumbai, Maharashtra 400001<br>
              📞 +91 98765 43210<br>
              ✉️ hjdunofficial21@gmail.com
            </p>
          </div>
        </div>

        <h3>🛍️ Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 18px;"><strong>Total Amount:</strong></span>
            <span style="font-size: 24px; font-weight: bold;">${formatPrice(orderDetails.totalAmount)}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing VilĀura!</strong></p>
          <p>Your order will be processed within 1-2 business days.</p>
          <p>For any queries, contact us at hjdunofficial21@gmail.com</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([billHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VilAura-Bill-${orderDetails.orderNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">No Order Details Found</h2>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <Card className="text-center mb-8 bg-gradient-hero shadow-card">
            <CardHeader className="pb-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl text-primary mb-2">Order Confirmed!</CardTitle>
              <CardDescription className="text-lg">
                Thank you for your purchase. Your order has been successfully placed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-background/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-2">Order Number</h3>
                <p className="text-2xl font-bold text-primary">{orderDetails.orderNumber}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={downloadBill} variant="outline" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download Bill
                </Button>
                <Button onClick={() => navigate('/')} size="lg">
                  <Home className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-border">
                      <div>
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t-2 border-primary">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-foreground">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">{formatPrice(orderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Payment Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">
                      {orderDetails.shippingInfo.firstName} {orderDetails.shippingInfo.lastName}
                    </p>
                    <p className="text-muted-foreground">{orderDetails.shippingInfo.address}</p>
                    <p className="text-muted-foreground">
                      {orderDetails.shippingInfo.city}, {orderDetails.shippingInfo.state} {orderDetails.shippingInfo.zipCode}
                    </p>
                    <p className="text-muted-foreground">📞 {orderDetails.shippingInfo.phone}</p>
                    <p className="text-muted-foreground">✉️ {orderDetails.shippingInfo.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><span className="font-semibold">Payment Method:</span> {orderDetails.paymentMethod}</p>
                    <p><span className="font-semibold">Status:</span> <span className="text-green-600">Confirmed</span></p>
                    <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Order confirmation email sent</li>
                    <li>• Processing will begin within 1-2 business days</li>
                    <li>• You'll receive tracking information once shipped</li>
                    <li>• Expected delivery: 3-5 business days</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;