import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { supabase } from '../supabase';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
} from '@/components/ui/chart';
import {
  TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight,
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Analytics = () => {
  const [customerData, setCustomerData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [foodItemData, setFoodItemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // Default to last 30 days

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersResponse, ordersResponse, foodItemsResponse] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('food_items').select('*')
      ]);

      setCustomerData(customersResponse.data || []);
      setOrderData(ordersResponse.data || []);
      setFoodItemData(foodItemsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCustomerGrowth = () => {
    return customerData
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((customer, index) => ({
        date: new Date(customer.created_at).toLocaleDateString(),
        customers: index + 1
      }))
      .slice(-parseInt(dateRange));
  };

  const processOrderTrends = () => {
    const orderCounts = orderData.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(orderCounts)
      .map(([date, count]) => ({ date, orders: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-parseInt(dateRange));
  };

  const processPopularItems = () => {
    const itemCounts = orderData.reduce((acc, order) => {
      acc[order.food_item] = (acc[order.food_item] || 0) + order.quantity;
      return acc;
    }, {});

    return Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const processRevenueTrends = () => {
    const revenueCounts = orderData.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + (order.quantity * 10); // Assuming $10 per item
      return acc;
    }, {});

    return Object.entries(revenueCounts)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-parseInt(dateRange));
  };

  const processCustomerLocations = () => {
    const locationCounts = customerData.reduce((acc, customer) => {
      if (customer.address) {
        const city = customer.address.split(',')[1]?.trim(); // Assuming address format: "Street, City, State ZIP"
        if (city) {
          acc[city] = (acc[city] || 0) + 1;
        }
      }
      return acc;
    }, {});

    return Object.entries(locationCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const calculateRetentionRate = () => {
    const totalCustomers = customerData.length;
    const activeCustomers = orderData.filter(order => {
      const orderDate = new Date(order.order_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    }).length;
    return (activeCustomers / totalCustomers * 100).toFixed(2);
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {trend > 0 ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
            {Math.abs(trend)}% from last {dateRange} days
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  const chartConfig = {
    customers: {
      label: "Customers",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
    foodItems: {
      label: "Food Items",
      color: "hsl(var(--chart-3))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value={customerData.length} icon={Users} trend={5.2} />
        <StatCard title="Total Orders" value={orderData.length} icon={ShoppingCart} trend={-2.1} />
        <StatCard title="Total Revenue" value={`$${orderData.reduce((sum, order) => sum + order.quantity * 10, 0)}`} icon={DollarSign} trend={10.5} />
        <StatCard title="Retention Rate" value={`${calculateRetentionRate()}%`} icon={Repeat} />
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <LineChart data={processCustomerGrowth()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="customers" stroke="var(--color-customers)" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Customer Locations</CardTitle>
                <CardDescription>Most common customer cities</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <BarChart data={processCustomerLocations()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-customers)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>Orders over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <AreaChart data={processOrderTrends()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="orders" stroke="var(--color-orders)" fill="var(--color-orders)" fillOpacity={0.3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Order Frequency</CardTitle>
                <CardDescription>Distribution of orders per customer</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie data={[
                      { name: '1-2 orders', value: 30 },
                      { name: '3-5 orders', value: 45 },
                      { name: '6+ orders', value: 25 },
                    ]} dataKey="value" nameKey="name" label />
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={processRevenueTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
              <CardDescription>Most ordered food items</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={processPopularItems()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-foodItems)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Button onClick={() => console.log('Export data')}>Export Data</Button>
      </div>
    </div>
  );
};

export default Analytics;
