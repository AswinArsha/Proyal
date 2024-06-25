import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const SidebarLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Restaurant System</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link to="/reward-management" className="block p-2 rounded hover:bg-gray-700">Reward Management</Link>
            </li>
            <li>
              <Link to="/customer-management" className="block p-2 rounded hover:bg-gray-700">Customer Management</Link>
            </li>
            <li>
              <Link to="/analytics" className="block p-2 rounded hover:bg-gray-700">Analytics</Link>
            </li>
            <li>
              <Link to="/food-management" className="block p-2 rounded hover:bg-gray-700">Food Management</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
