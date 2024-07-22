import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Users, BarChart2, Coffee } from 'lucide-react';

const Home = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <Card className="w-64 h-full p-4 bg-white shadow-md flex flex-col justify-between">
        <nav className="space-y-4">
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/reward-management' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="reward-management" className="w-full text-left flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Reward Management</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/customer-management' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="customer-management" className="w-full text-left flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Customer Management</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/analytics' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="analytics" className="w-full text-left flex items-center space-x-2">
              <BarChart2 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/food-management' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="food-management" className="w-full text-left flex items-center space-x-2">
              <Coffee className="w-5 h-5" />
              <span>Food Management</span>
            </Link>
          </Button>
        </nav>
      </Card>
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
