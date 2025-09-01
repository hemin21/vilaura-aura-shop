import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Package, Clock, Eye, Truck, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OwnerNotification {
  id: string;
  type: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  details: any;
  is_read: boolean;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: any;
  created_at: string;
}

export default function OwnerDashboard() {
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchOrders();
    
    // Set up real-time notifications
    const channel = supabase
      .channel('owner-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'owner_notifications' },
        (payload) => {
          toast.success(`🔔 New Order: ${payload.new.order_number}`);
          fetchNotifications();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchOrders();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('owner_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('owner_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const refreshData = () => {
    fetchNotifications();
    fetchOrders();
    toast.success('Data refreshed');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const confirmedOrders = orders.filter(order => order.status === 'confirmed');
  const pendingOrders = orders.filter(order => order.status === 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🌿 VilĀura Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor your orders and process deliveries</p>
          </div>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{confirmedOrders.length}</p>
                  <p className="text-sm text-gray-600">Confirmed Orders</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
                  <p className="text-sm text-gray-600">New Notifications</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="confirmed-orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="confirmed-orders" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Ready to Ship ({confirmedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            New Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed-orders" className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">📦 Orders Ready for Processing</CardTitle>
              <p className="text-green-700 text-sm">These orders are confirmed and paid. Process them for delivery!</p>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4">
            {confirmedOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No confirmed orders ready for shipping</p>
                </CardContent>
              </Card>
            ) : (
              confirmedOrders.map((order) => (
                <Card key={order.id} className="border-green-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-700">
                        🚀 {order.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          READY TO SHIP
                        </Badge>
                        <Badge variant="outline">
                          ₹{order.total_amount}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer</p>
                        <p className="font-medium">
                          {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{order.shipping_address?.email}</p>
                        <p className="text-sm text-gray-500">📞 {order.shipping_address?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payment Status</p>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {order.payment_status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Order Time</p>
                        <p className="text-xs">{formatDate(order.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Actions</p>
                        <div className="flex flex-col gap-2 mt-1">
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Mark as Shipped
                          </Button>
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Delivered
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-1">📍 Shipping Address</p>
                      <p className="text-sm text-gray-700">
                        {order.shipping_address?.address}<br/>
                        {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}<br/>
                        {order.shipping_address?.country}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={`${notification.is_read ? 'opacity-70' : 'border-primary'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        🛍️ New Order: {notification.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Badge variant="default">New</Badge>
                        )}
                        <Badge variant="outline">
                          ₹{notification.total_amount}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer</p>
                        <p className="font-medium">{notification.customer_name}</p>
                        <p className="text-sm text-gray-500">{notification.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Order Time</p>
                        <p className="font-medium">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>

                    {notification.details?.items && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Items Ordered</p>
                        <div className="space-y-1">
                          {notification.details.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} x{item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {notification.details?.shipping_address && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Shipping Address</p>
                        <p className="text-sm text-gray-700">
                          {notification.details.shipping_address.address}, {notification.details.shipping_address.city}, {notification.details.shipping_address.state} {notification.details.shipping_address.zipCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {notification.details.shipping_address.phone}
                        </p>
                      </div>
                    )}

                    {!notification.is_read && (
                      <Button 
                        onClick={() => markAsRead(notification.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Mark as Read
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Order {order.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant="outline">
                          ₹{order.total_amount}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer</p>
                        <p className="font-medium">
                          {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{order.shipping_address?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payment Status</p>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {order.payment_status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Order Date</p>
                        <p className="font-medium">{formatDate(order.created_at)}</p>
                      </div>
                    </div>

                    {order.shipping_address && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Shipping Address</p>
                        <p className="text-sm text-gray-700">
                          {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {order.shipping_address.phone}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}