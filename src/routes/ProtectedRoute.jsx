import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verificar que el token no esté expirado
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp > currentTime) {
            setIsAuthenticated(true);
          } else {
            // Token expirado
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Token inválido
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Prevenir navegación hacia atrás que pueda cerrar sesión
    const handleBeforeUnload = (e) => {
      // Solo mostrar confirmación si el usuario intenta salir de la aplicación
      // No mostrar si está navegando dentro de la app
      if (window.location.pathname === '/dashboard') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Prevenir navegación con el botón de retroceder del navegador
    const handlePopState = (e) => {
      // Si el usuario presiona retroceder, mantenerlo en el dashboard
      if (window.location.pathname !== '/dashboard') {
        window.history.pushState(null, '', '/dashboard');
        // Forzar redirección al dashboard
        window.location.href = '/dashboard';
      }
    };

    // Agregar el estado inicial al historial para prevenir retroceder
    window.history.pushState(null, '', '/dashboard');

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Mostrar loading mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f7f7f7] to-[#e9ecef] dark:from-[#181c1f] dark:to-[#23272b]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7ed6a7] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute; 