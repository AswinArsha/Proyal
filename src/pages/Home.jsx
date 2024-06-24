import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Restaurant Management System</h1>
      <nav>
        <ul>
          <li><Link to="/reward-management">Reward Management</Link></li>
          <li><Link to="/customer-management">Customer Management</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
          <li><Link to="/food-management">Food Management</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
