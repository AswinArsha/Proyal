import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { supabase } from '../supabase';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from '@/components/ui/chart';
import { TrendingUp, Users, ShoppingCart, ArrowUpRight, ArrowDownRight, ShoppingBasket } from 'lucide-react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 15;

const Analytics = () => {
  const [customerData, setCustomerData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [foodItemData, setFoodItemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      key: 'selection'
    }
  ]);
  const [mostPopularPage, setMostPopularPage] = useState(1);
  const [leastPopularPage, setLeastPopularPage] = useState(1);
  const [locationPage, setLocationPage] = useState(1);

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
    const filteredData = customerData.filter(customer => {
      const createdAt = new Date(customer.created_at);
      return createdAt >= dateRange[0].startDate && createdAt <= dateRange[0].endDate;
    });

    return filteredData.map((customer, index) => ({
      date: new Date(customer.created_at).toLocaleDateString(),
      customers: index + 1
    })).slice(-30);
  };

  const processOrderTrends = () => {
    const filteredData = orderData.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= dateRange[0].startDate && orderDate <= dateRange[0].endDate;
    });

    const orderCounts = filteredData.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(orderCounts).map(([date, count]) => ({ date, orders: count })).slice(-30);
  };

  const processPopularItems = () => {
    const filteredData = orderData.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= dateRange[0].startDate && orderDate <= dateRange[0].endDate;
    });

    const itemCounts = filteredData.reduce((acc, order) => {
      acc[order.food_item] = (acc[order.food_item] || 0) + order.quantity;
      return acc;
    }, {});

    const sortedItems = Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      mostPopular: sortedItems,
      leastPopular: sortedItems.slice().reverse()
    };
  };

  const processTopCustomerLocations = () => {
    const locationCounts = customerData.reduce((acc, customer) => {
      const location = customer.address || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(locationCounts).map(([location, count]) => ({ location, count }));
  };

  const processNewCustomersThisMonth = () => {
    const startOfMonth = new Date(dateRange[0].startDate.getFullYear(), dateRange[0].startDate.getMonth(), 1);
    const endOfMonth = new Date(dateRange[0].startDate.getFullYear(), dateRange[0].startDate.getMonth() + 1, 0);
    return customerData.filter(customer => {
      const createdAt = new Date(customer.created_at);
      return createdAt >= startOfMonth && createdAt <= endOfMonth;
    }).length;
  };

  const processRevenueTrends = () => {
    const filteredData = orderData.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= dateRange[0].startDate && orderDate <= dateRange[0].endDate;
    });

    const revenueCounts = filteredData.reduce((acc, order) => {
      const date = new Date(order.order_date).toLocaleDateString();
      const revenue = order.quantity * 10;
      acc[date] = (acc[date] || 0) + revenue;
      return acc;
    }, {});

    return Object.entries(revenueCounts).map(([date, revenue]) => ({ date, revenue })).slice(-30);
  };

  const processCustomerSegmentation = () => {
    const segmentation = {
      "1-2 orders": 0,
      "3-5 orders": 0,
      "6-10 orders": 0,
      "11+ orders": 0,
    };

    customerData.forEach(customer => {
      const customerOrders = orderData.filter(order => order.customer_id === customer.id);
      const orderCount = customerOrders.length;

      if (orderCount <= 2) segmentation["1-2 orders"]++;
      else if (orderCount <= 5) segmentation["3-5 orders"]++;
      else if (orderCount <= 10) segmentation["6-10 orders"]++;
      else segmentation["11+ orders"]++;
    });

    return Object.entries(segmentation).map(([segment, count]) => ({ segment, count }));
  };

  const calculatePercentageChange = (currentValue, previousValue) => {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== null && (
          <p className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {trend > 0 ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
            {Math.abs(trend).toFixed(1)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const currentMonthStart = startOfMonth(new Date());
  const previousMonthStart = startOfMonth(subMonths(new Date(), 1));
  const previousMonthEnd = endOfMonth(subMonths(new Date(), 1));

  const currentMonthCustomers = customerData.filter(customer => {
    const createdAt = new Date(customer.created_at);
    return createdAt >= currentMonthStart;
  }).length;

  const previousMonthCustomers = customerData.filter(customer => {
    const createdAt = new Date(customer.created_at);
    return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
  }).length;

  const currentMonthOrders = orderData.filter(order => {
    const orderDate = new Date(order.order_date);
    return orderDate >= currentMonthStart;
  }).length;

  const previousMonthOrders = orderData.filter(order => {
    const orderDate = new Date(order.order_date);
    return orderDate >= previousMonthStart && orderDate <= previousMonthEnd;
  }).length;

  const newCustomersThisMonth = processNewCustomersThisMonth();
  const previousMonthNewCustomers = customerData.filter(customer => {
    const createdAt = new Date(customer.created_at);
    return createdAt >= previousMonthStart && createdAt <= previousMonthEnd;
  }).length;

  const customerTrend = calculatePercentageChange(currentMonthCustomers, previousMonthCustomers);
  const orderTrend = calculatePercentageChange(currentMonthOrders, previousMonthOrders);
  const newCustomerTrend = calculatePercentageChange(newCustomersThisMonth, previousMonthNewCustomers);

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

  const pieChartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))"
  ];

  const { mostPopular, leastPopular } = processPopularItems();

  const getPagedItems = (items, page, pageSize) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end > items.length ? items.length : end);
  };

  const handlePreviousPage = (pageSetter, currentPage) => {
    if (currentPage > 1) {
      pageSetter(currentPage - 1);
    }
  };

  const handleNextPage = (pageSetter, currentPage, items, pageSize) => {
    if (currentPage * pageSize < items.length) {
      pageSetter(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      <div className="flex gap-4 w-2/3">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 w-2/3">
          <StatCard title="Total Customers" value={currentMonthCustomers} icon={Users} trend={customerTrend} />
          <StatCard title="Total Orders" value={currentMonthOrders} icon={ShoppingCart} trend={orderTrend} />
          <StatCard title="New Customers " value={newCustomersThisMonth} icon={Users} trend={newCustomerTrend} />
          <StatCard title="Menu Items" value={foodItemData.length} icon={ShoppingBasket} trend={null} />
        </div>

        <div className="w-1/3 ml-4">
          <DateRangePicker
            onChange={item => setDateRange([item.selection])}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            rangeColors={['#3f51b5']}
            staticRanges={[
              {
                label: 'Today',
                range: () => ({
                  startDate: new Date(),
                  endDate: new Date(),
                }),
                isSelected(range) {
                  const today = new Date();
                  return (
                    range.startDate.toDateString() === today.toDateString() &&
                    range.endDate.toDateString() === today.toDateString()
                  );
                },
              },
              {
                label: 'Yesterday',
                range: () => ({
                  startDate: addDays(new Date(), -1),
                  endDate: addDays(new Date(), -1),
                }),
                isSelected(range) {
                  const yesterday = addDays(new Date(), -1);
                  return (
                    range.startDate.toDateString() === yesterday.toDateString() &&
                    range.endDate.toDateString() === yesterday.toDateString()
                  );
                },
              },
              {
                label: 'This Week',
                range: () => ({
                  startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
                  endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
                }),
                isSelected(range) {
                  const now = new Date();
                  return (
                    range.startDate.toDateString() === startOfWeek(now, { weekStartsOn: 1 }).toDateString() &&
                    range.endDate.toDateString() === endOfWeek(now, { weekStartsOn: 1 }).toDateString()
                  );
                },
              },
              {
                label: 'Last Week',
                range: () => ({
                  startDate: startOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 }),
                  endDate: endOfWeek(addDays(new Date(), -7), { weekStartsOn: 1 }),
                }),
                isSelected(range) {
                  const now = new Date();
                  const lastWeekStart = startOfWeek(addDays(now, -7), { weekStartsOn: 1 });
                  const lastWeekEnd = endOfWeek(addDays(now, -7), { weekStartsOn: 1 });
                  return (
                    range.startDate.toDateString() === lastWeekStart.toDateString() &&
                    range.endDate.toDateString() === lastWeekEnd.toDateString()
                  );
                },
              },
              {
                label: 'This Month',
                range: () => ({
                  startDate: startOfMonth(new Date()),
                  endDate: endOfMonth(new Date()),
                }),
                isSelected(range) {
                  const now = new Date();
                  return (
                    range.startDate.toDateString() === startOfMonth(now).toDateString() &&
                    range.endDate.toDateString() === endOfMonth(now).toDateString()
                  );
                },
              },
              {
                label: 'Last Month',
                range: () => ({
                  startDate: startOfMonth(addDays(new Date(), -30)),
                  endDate: endOfMonth(addDays(new Date(), -30)),
                }),
                isSelected(range) {
                  const now = new Date();
                  const lastMonthStart = startOfMonth(addDays(now, -30));
                  const lastMonthEnd = endOfMonth(addDays(now, -30));
                  return (
                    range.startDate.toDateString() === lastMonthStart.toDateString() &&
                    range.endDate.toDateString() === lastMonthEnd.toDateString()
                  );
                },
              },
            ]}
            inputRanges={[]}
          />
        </div>
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Customer Growth</TabsTrigger>
          <TabsTrigger value="orders">Order Trends</TabsTrigger>
          <TabsTrigger value="segmentation">Customer Segmentation</TabsTrigger>
          <TabsTrigger value="locations">Top Customer Locations</TabsTrigger>
          <TabsTrigger value="items">Popular Items</TabsTrigger>
        </TabsList>
             <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New customers over time</CardDescription>
            </CardHeader>
            <CardContent className="h-90%">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="20%">
                  <AreaChart
                    data={processCustomerGrowth()}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area dataKey="customers" type="natural" fill="var(--color-customers)" fillOpacity={0.4} stroke="var(--color-customers)" />
                  </AreaChart>
                </ResponsiveContainer>
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
            <CardContent className="h-90%">
              <ChartContainer config={chartConfig}>
                <div className="flex justify-center">
                  <div className="w-full p-2">
                    <ResponsiveContainer width="100%" height={360}>
                      <LineChart data={processOrderTrends()} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line dataKey="orders" type="natural" stroke="var(--color-orders)" strokeWidth={2} dot={{ fill: "var(--color-orders)" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
              <CardDescription>Most and least ordered food items</CardDescription>
            </CardHeader>
            <CardContent className="h-90%">
              <ChartContainer config={chartConfig}>
                <div className="flex justify-center ">
                  <div className="w-full p-2">
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={getPagedItems(mostPopular, mostPopularPage, PAGE_SIZE)} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-foodItems)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePreviousPage(setMostPopularPage, mostPopularPage)} disabled={mostPopularPage === 1} />
                        </PaginationItem>
                        {[...Array(Math.ceil(mostPopular.length / PAGE_SIZE)).keys()].map(page => (
                          <PaginationItem key={page + 1}>
                            <PaginationLink onClick={() => setMostPopularPage(page + 1)} isActive={mostPopularPage === page + 1}>
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => handleNextPage(setMostPopularPage, mostPopularPage, mostPopular, PAGE_SIZE)} disabled={mostPopularPage === Math.ceil(mostPopular.length / PAGE_SIZE)} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customer Locations</CardTitle>
              <CardDescription>Top locations from which orders are placed</CardDescription>
            </CardHeader>
            <CardContent className="h-90%">
              <ChartContainer config={chartConfig}>
                <div className="flex justify-center ">
                  <div className="w-full p-2">
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={getPagedItems(processTopCustomerLocations(), locationPage, PAGE_SIZE)} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="location" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-customers)" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePreviousPage(setLocationPage, locationPage)} disabled={locationPage === 1} />
                        </PaginationItem>
                        {[...Array(Math.ceil(processTopCustomerLocations().length / PAGE_SIZE)).keys()].map(page => (
                          <PaginationItem key={page + 1}>
                            <PaginationLink onClick={() => setLocationPage(page + 1)} isActive={locationPage === page + 1}>
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={() => handleNextPage(setLocationPage, locationPage, processTopCustomerLocations(), PAGE_SIZE)} disabled={locationPage === Math.ceil(processTopCustomerLocations().length / PAGE_SIZE)} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="segmentation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation</CardTitle>
              <CardDescription>Segmentation based on order frequency</CardDescription>
            </CardHeader>
            <CardContent className="h-90% ">
              <ChartContainer config={chartConfig}>
                <div className="flex justify-center ">
                  <div className="w-full p-2">
                    <ResponsiveContainer width="100%" height={360}>
                      <PieChart>
                        <Pie data={processCustomerSegmentation()} dataKey="count" nameKey="segment" outerRadius={150} fill="var(--color-customers)">
                          {processCustomerSegmentation().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
