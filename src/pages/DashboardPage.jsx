import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import { jwtDecode } from 'jwt-decode';

function DashboardPage() {
  const token = localStorage.getItem('token');
  let user = { username: '', role: '' };

  if (token) {
    try {
      const decoded = jwtDecode(token);
      user = { username: decoded.username, role: decoded.role };
    } catch (e) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default DashboardPage; 