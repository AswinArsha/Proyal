
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart } from 'recharts';
import { supabase } from '../supabase';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const Analytics = () => {
  const [customerData, setCustomerData] = useState([]);
  const [newCustomersData, setNewCustomersData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [retentionRate, setRetentionRate] = useState(0);

  useEffect(() => {
    fetchCustomerData();
    fetchNewCustomersData();
    fetchLocationData();
    calculateRetentionRate();
  }, []);

  const fetchCustomerData = async () => {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
      console.log('Error fetching customer data:', error);
    } else {
      setCustomerData(data);
    }
  };

  const fetchNewCustomersData = async () => {
    const { data, error } = await supabase.rpc('new_customers_over_time');
    if (error) {
      console.log('Error fetching new customers data:', error);
    } else {
      setNewCustomersData(data);
    }
  };

  const fetchLocationData = async () => {
    const { data, error } = await supabase.rpc('customer_locations');
    if (error) {
      console.log('Error fetching location data:', error);
    } else {
      setLocationData(data);
    }
  };

  const calculateRetentionRate = async () => {
    const { data, error } = await supabase.rpc('customer_retention_rate');
    if (error) {
      console.log('Error calculating retention rate:', error);
    } else {
      setRetentionRate(data);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      {/* Total Number of Customers */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Total Number of Customers</h3>
        <ChartContainer config={{ totalCustomers: { label: 'Total Customers', color: '#2563eb' } }} className="min-h-[300px] w-full">
          <PieChart>
            <Pie data={customerData} dataKey="count" nameKey="label" fill="var(--color-totalCustomers)" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </div>

      {/* New Customers Added Over Time */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">New Customers Added Over Time</h3>
        <ChartContainer config={{ newCustomers: { label: 'New Customers', color: '#60a5fa' } }} className="min-h-[300px] w-full">
          <LineChart data={newCustomersData}>
            <Line type="monotone" dataKey="count" stroke="var(--color-newCustomers)" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </div>

      {/* Most Common Customer Locations */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Most Common Customer Locations</h3>
        <ChartContainer config={{ locations: { label: 'Locations', color: '#34d399' } }} className="min-h-[300px] w-full">
          <BarChart data={locationData} layout="vertical">
            <Bar dataKey="count" fill="var(--color-locations)" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Customer Retention Rate */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Customer Retention Rate</h3>
        <ChartContainer config={{ retentionRate: { label: 'Retention Rate', color: '#facc15' } }} className="min-h-[300px] w-full">
          <RadialBarChart innerRadius="10%" outerRadius="80%" data={[{ name: 'Retention Rate', value: retentionRate, fill: '#facc15' }]}>
            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </RadialBarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default Analytics;
