import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateEmail, validatePhone, validatePincode, validateName, validateAddress, formatPrice, formatPhoneNumber, fetchPlaceFromPincode } from '@/utils/validation';
import { SignIn, useUser } from '@clerk/clerk-react';

const paymentMethods = [
  { id: 'upi', label: 'UPI Payment', description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit/Debit Card', description: 'Pay using Visa, MasterCard, RuPay cards' },
  { id: 'netbanking', label: 'Net Banking', description: 'Pay using your bank\'s net banking service' },
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order' }
];

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  const { isSignedIn, user: clerkUser } = useUser();

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Redirect if cart is empty
  if (items.length === 0 && !orderComplete) {
    return <Navigate to="/cart" replace />;
  }

  // Show Clerk SignIn if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to continue</CardTitle>
            <CardDescription>You must be signed in to proceed to checkout.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn routing="hash" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setShippingInfo(prev => ({ ...prev, [name]: formattedPhone }));
    } else if (name === 'zipCode') {
      // Auto-detect city and state from pincode
      setShippingInfo(prev => ({ ...prev, [name]: value }));
      
      if (value.length === 6) {
        const placeData = await fetchPlaceFromPincode(value);
        if (placeData) {
          setShippingInfo(prev => ({
            ...prev,
            city: placeData.city,
            state: placeData.state
          }));
          toast({
            title: "Location detected",
            description: `City: ${placeData.city}, State: ${placeData.state}`,
          });
        }
      }
    } else {
      setShippingInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!validateName(shippingInfo.firstName)) {
      toast({
        variant: "destructive",
        title: "Invalid First Name",
        description: "First name should only contain letters and spaces.",
      });
      return false;
    }
    if (!validateName(shippingInfo.lastName)) {
      toast({
        variant: "destructive",
        title: "Invalid Last Name",
        description: "Last name should only contain letters and spaces.",
      });
      return false;
    }
    if (!validateEmail(shippingInfo.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return false;
    }
    if (!validatePhone(shippingInfo.phone)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid Indian phone number (10 digits).",
      });
      return false;
    }
    if (!validateAddress(shippingInfo.address)) {
      toast({
        variant: "destructive",
        title: "Invalid Address",
        description: "Address should be at least 10 characters long.",
      });
      return false;
    }
    if (!validatePincode(shippingInfo.zipCode)) {
      toast({
        variant: "destructive",
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit Indian pincode.",
      });
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Save shipping info to localStorage for payment page
    localStorage.setItem('shipping_info', JSON.stringify(shippingInfo));
    
    // Navigate to payment page
    navigate('/mock-payment');
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Order Complete!</CardTitle>
            <CardDescription>Thank you for your purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <p className="text-muted-foreground">
                Your order has been successfully placed and will be processed soon.
              </p>
              <Button onClick={() => window.location.href = '/'} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
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

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Information */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Please provide your delivery details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProceedToPayment} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={shippingInfo.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={shippingInfo.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Mobile Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile number"
                        maxLength={14}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        placeholder="Enter your complete address"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">Pincode (Auto-detects City/State)</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : `Proceed to Payment - ${formatPrice(totalPrice)}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;