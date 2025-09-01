import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Package, Users, DollarSign, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  monthlyData: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

export default function OwnerAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch orders with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!inner(
            quantity,
            price,
            products!inner(name)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate analytics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Get unique customers
      const uniqueCustomers = new Set(
        orders?.map(order => {
          const address = order.shipping_address as any;
          return address?.email;
        }).filter(Boolean)
      ).size;

      // Monthly data
      const monthlyMap = new Map();
      orders?.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        });
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { month, orders: 0, revenue: 0 });
        }
        const data = monthlyMap.get(month);
        data.orders += 1;
        data.revenue += Number(order.total_amount);
      });

      const monthlyData = Array.from(monthlyMap.values()).slice(-6); // Last 6 months

      // Status data
      const statusMap = new Map();
      orders?.forEach(order => {
        const status = order.status || 'pending';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const statusData = Array.from(statusMap.entries()).map(([status, count], index) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'][index % 5]
      }));

      // Top products
      const productMap = new Map();
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productName = item.products.name;
          if (!productMap.has(productName)) {
            productMap.set(productName, { name: productName, quantity: 0, revenue: 0 });
          }
          const product = productMap.get(productName);
          product.quantity += item.quantity;
          product.revenue += item.price * item.quantity;
        });
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setAnalytics({
        totalOrders,
        totalRevenue,
        averageOrderValue,
        totalCustomers: uniqueCustomers,
        monthlyData,
        statusData,
        topProducts
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Business Analytics</h2>
        <div className="flex gap-2">
          {['7', '30', '90', '365'].map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days === '365' ? '1 Year' : `${days} Days`}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">₹{analytics.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600">₹{analytics.averageOrderValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Monthly Revenue & Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="revenue" />
                <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" name="orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    #{index + 1}
                  </Badge>
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-gray-600">Quantity sold: {product.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}