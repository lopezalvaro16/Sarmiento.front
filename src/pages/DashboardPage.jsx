import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';

function DashboardPage() {
  // Leer usuario desde localStorage (guardado en el login)
  const userStr = localStorage.getItem('user');
  let user = { username: '', role: '' };

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Error al leer usuario:', e);
      user = { username: '', role: '' };
    }
  }

  const handleLogout = () => {
    // Confirmar antes de cerrar sesión
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default DashboardPage; 