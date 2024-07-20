import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Home from './pages/Home';
import RewardManagement from './components/RewardManagement';
import CustomerManagement from './components/CustomerManagement';
import Analytics from './components/Analytics';
import FoodManagement from './components/FoodManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />}>
          <Route path="" element={<Navigate to="reward-management" />} />
          <Route path="reward-management" element={<RewardManagement />} />
          <Route path="customer-management" element={<CustomerManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="food-management" element={<FoodManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
