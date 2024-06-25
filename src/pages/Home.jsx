import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Home = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <Card className="w-64 h-full p-4 bg-white shadow-md">
        <nav className="space-y-4">
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/reward-management' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="reward-management" className="w-full text-left">
              Reward Management
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/customer-management' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="customer-management" className="w-full text-left">
              Customer Management
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/analytics' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="analytics" className="w-full text-left">
              Analytics
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            className={`w-full justify-start ${location.pathname === '/home/food-management' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Link to="food-management" className="w-full text-left">
              Food Management
            </Link>
          </Button>
        </nav>
      </Card>
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Home;
