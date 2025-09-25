import { useEffect } from 'react';

export const usePreventBackNavigation = () => {
  useEffect(() => {
    // Función para manejar el botón de retroceder
    const handlePopState = (event) => {
      console.log('Botón de retroceder presionado, redirigiendo al dashboard...');
      
      // Siempre redirigir al dashboard cuando se presiona retroceder
      window.history.pushState(null, '', '/dashboard');
      
      // Forzar navegación al dashboard
      window.location.replace('/dashboard');
    };

    // Función para manejar beforeunload (cuando el usuario intenta cerrar la pestaña)
    const handleBeforeUnload = (event) => {
      // Solo prevenir si no es una navegación interna
      if (!event.target.activeElement?.closest('a')) {
        event.preventDefault();
        event.returnValue = '¿Estás seguro de que quieres salir?';
        return '¿Estás seguro de que quieres salir?';
      }
    };

    // Agregar múltiples estados al historial para interceptar el botón de retroceder
    window.history.pushState(null, '', '/dashboard');
    window.history.pushState(null, '', '/dashboard');
    window.history.pushState(null, '', '/dashboard');

    // Escuchar eventos
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Limpiar event listeners al desmontar
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

export default usePreventBackNavigation;
