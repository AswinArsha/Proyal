import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '../supabase';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent
} from '@/components/ui/chart';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics = () => {
  const [customerData, setCustomerData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [foodItemData, setFoodItemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].startDate.toISOString();
      const endDate = dateRange[0].endDate.toISOString();

      const [customersResponse, ordersResponse, foodItemsResponse] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('orders').select('*').gte('order_date', startDate).lte('order_date', endDate),
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
        date: format(new Date(customer.created_at), 'yyyy-MM-dd'),
        customers: index + 1
      }));
  };

  const processOrderTrends = () => {
    const orderCounts = orderData.reduce((acc, order) => {
      const date = format(new Date(order.order_date), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(orderCounts).map(([date, count]) => ({ date, orders: count }));
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
      const date = format(new Date(order.order_date), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + (order.quantity * 10); // Assuming $10 per item
      return acc;
    }, {});

    return Object.entries(revenueCounts).map(([date, revenue]) => ({ date, revenue }));
  };

  const processCustomerSegmentation = () => {
    const customerOrders = orderData.reduce((acc, order) => {
      acc[order.customer_id] = (acc[order.customer_id] || 0) + 1;
      return acc;
    }, {});

    const segments = {
      'High': 0,
      'Medium': 0,
      'Low': 0
    };

    Object.values(customerOrders).forEach(orderCount => {
      if (orderCount > 10) segments['High']++;
      else if (orderCount > 5) segments['Medium']++;
      else segments['Low']++;
    });

    return Object.entries(segments).map(([name, value]) => ({ name, value }));
  };

  const processRetentionChurn = () => {
    // This is a simplified calculation and should be adjusted based on your specific business logic
    const totalCustomers = customerData.length;
    const activeCustomers = new Set(orderData.map(order => order.customer_id)).size;
    const churnRate = ((totalCustomers - activeCustomers) / totalCustomers) * 100;
    const retentionRate = 100 - churnRate;

    return [
      { name: 'Retention Rate', value: retentionRate },
      { name: 'Churn Rate', value: churnRate }
    ];
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {trend > 0 ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
          {Math.abs(trend)}% from last period
        </p>
      </CardContent>
    </Card>
  );

  const chartConfig = {
    customers: { label: "Customers", color: "hsl(var(--chart-1))" },
    orders: { label: "Orders", color: "hsl(var(--chart-2))" },
    revenue: { label: "Revenue", color: "hsl(var(--chart-3))" },
    foodItems: { label: "Food Items", color: "hsl(var(--chart-4))" },
    retention: { label: "Retention", color: "hsl(var(--chart-5))" },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>

      <DateRangePicker
        ranges={dateRange}
        onChange={item => setDateRange([item.selection])}
        className="mb-4"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Customers" value={customerData.length} icon={Users} trend={5.2} />
        <StatCard title="Total Orders" value={orderData.length} icon={ShoppingCart} trend={-2.1} />
        <StatCard title="Total Revenue" value={`$${orderData.reduce((sum, order) => sum + order.quantity * 10, 0)}`} icon={DollarSign} trend={10.5} />
        <StatCard title="Menu Items" value={foodItemData.length} icon={TrendingUp} trend={3.2} />
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Customer Growth</TabsTrigger>
          <TabsTrigger value="orders">Order Trends</TabsTrigger>
          <TabsTrigger value="items">Popular Items</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="segmentation">Customer Segmentation</TabsTrigger>
          <TabsTrigger value="retention">Retention & Churn</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New customers over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={processCustomerGrowth()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="customers" stroke="var(--color-customers)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Trends</CardTitle>
              <CardDescription>Orders over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={processOrderTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="var(--color-orders)" />
                </BarChart>
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
                <PieChart>
                  <Pie
                    data={processPopularItems()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--color-foodItems)"
                    label
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Revenue over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={processRevenueTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
              <CardDescription>Customers segmented by order frequency</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <PieChart>
                  <Pie
                    data={processCustomerSegmentation()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--color-customers)"
                    label
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention & Churn</CardTitle>
              <CardDescription>Customer retention and churn rates</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <PieChart>
                  <Pie
                    data={processRetentionChurn()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--color-retention)"
                    label
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
