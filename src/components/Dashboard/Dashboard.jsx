import React, { useState, useRef } from 'react';
import CanchasSection from './sections/CanchasSection';
import CobranzasSection from './sections/CobranzasSection';
import BuffetSection from './sections/BuffetSection';
import ReservasSection from './sections/ReservasSection';
import EstablecimientosSection from './sections/EstablecimientosSection';
import HorariosSection from './sections/HorariosSection';
import MantenimientoSection from './sections/MantenimientoSection';
import PagosSection from './sections/PagosSection';
import DeudasSection from './sections/DeudasSection';
import ReportesSection from './sections/ReportesSection';
import StockSection from './sections/StockSection';
import ComprasSection from './sections/ComprasSection';
import VentasSection from './sections/VentasSection';
import InicioSection from './sections/InicioSection';
import { FiHome, FiCalendar, FiClock, FiTool, FiDollarSign, FiAlertCircle, FiBarChart2, FiBox, FiShoppingCart, FiTrendingUp, FiLogOut, FiMoon, FiSun, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import usePreventBackNavigation from '../../hooks/usePreventBackNavigation';

function Dashboard({ user, onLogout }) {
  // Simulación de usuario si no se pasa por props
  const admin = user || { username: 'admin', role: 'canchas' };

  // Prevenir navegación hacia atrás que pueda cerrar sesión
  usePreventBackNavigation();

  // Opciones de menú según el rol
  const menuOptions = {
    canchas: [
      { label: 'Inicio', section: 'inicio', icon: <FiHome /> },
      { label: 'Reservas', section: 'reservas', icon: <FiCalendar /> },
      { label: 'Establecimientos', section: 'establecimientos', icon: <FiMapPin /> },
      { label: 'Horarios', section: 'horarios', icon: <FiClock /> },
      { label: 'Mantenimiento', section: 'mantenimiento', icon: <FiTool /> },
    ],
    cobranzas: [
      { label: 'Inicio', section: 'inicio', icon: <FiHome /> },
      { label: 'Pagos', section: 'pagos', icon: <FiDollarSign /> },
      { label: 'Deudas', section: 'deudas', icon: <FiAlertCircle /> },
      { label: 'Reportes', section: 'reportes', icon: <FiBarChart2 /> },
    ],
    buffet: [
      { label: 'Inicio', section: 'inicio', icon: <FiHome /> },
      { label: 'Stock', section: 'stock', icon: <FiBox /> },
      { label: 'Compras', section: 'compras', icon: <FiShoppingCart /> },
      { label: 'Ventas', section: 'ventas', icon: <FiTrendingUp /> },
    ],
  };

  // Por defecto, selecciona la primera opción del menú
  const [selectedSection, setSelectedSection] = useState(menuOptions[admin.role]?.[0]?.section || 'inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarTimeout = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Abrir sidebar con animación
  const openSidebar = () => {
    setSidebarVisible(true);
    setTimeout(() => setSidebarOpen(true), 10); // Espera para activar la transición
  };

  // Cerrar sidebar con animación
  const closeSidebar = () => {
    setSidebarOpen(false);
    sidebarTimeout.current = setTimeout(() => setSidebarVisible(false), 300); // Espera a que termine la transición
  };

  React.useEffect(() => () => clearTimeout(sidebarTimeout.current), []);

  // Renderiza la sección correspondiente
  const renderSection = () => {
    if (selectedSection === 'inicio') return <InicioSection user={admin} onNuevaReserva={() => { setSelectedSection('reservas'); setModalOpen(true); }} onIrHorarios={() => setSelectedSection('horarios')} onIrMantenimiento={() => setSelectedSection('mantenimiento')} />;
    if (admin.role === 'canchas') {
      if (selectedSection === 'reservas') return <ReservasSection modalOpen={modalOpen} setModalOpen={setModalOpen} />;
      if (selectedSection === 'establecimientos') return <EstablecimientosSection modalOpen={modalOpen} setModalOpen={setModalOpen} />;
      if (selectedSection === 'horarios') return <HorariosSection />;
      if (selectedSection === 'mantenimiento') return <MantenimientoSection />;
      return <CanchasSection />;
    }
    if (admin.role === 'cobranzas') {
      if (selectedSection === 'pagos') return <PagosSection />;
      if (selectedSection === 'deudas') return <DeudasSection />;
      if (selectedSection === 'reportes') return <ReportesSection />;
      return <CobranzasSection />;
    }
    if (admin.role === 'buffet') {
      if (selectedSection === 'stock') return <StockSection modalOpen={modalOpen} setModalOpen={setModalOpen} />;
      if (selectedSection === 'compras') return <ComprasSection />;
      if (selectedSection === 'ventas') return <VentasSection />;
      return <BuffetSection />;
    }
    return <div>Selecciona una opción del menú.</div>;
  };

  // Cierra el sidebar al seleccionar una opción en móvil
  const handleMenuClick = (section) => {
    setSelectedSection(section);
    setShowWelcome(false);
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f7f7f7] to-[#e9ecef] dark:from-[#181c1f] dark:to-[#23272b]">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex flex-col w-72 sidebar-blur p-4 gap-4 shadow-xl rounded-r-3xl mt-2 mb-2 ml-2 fixed top-0 left-0 z-20"
        style={{height: 'calc(100vh - 1rem)'}}>
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="rounded-full bg-gradient-to-br from-[#b8b5ff] to-[#7ed6a7] text-white w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg">S</div>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">{admin.username}</span>
          <button
            className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#23272b] text-gray-700 dark:text-gray-200 shadow hover:bg-gray-200 dark:hover:bg-[#2d3237] transition-all"
            onClick={() => setDarkMode(d => !d)}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            {darkMode ? 'Claro' : 'Oscuro'}
          </button>
        </div>
        <nav className="flex flex-col gap-3 w-full flex-1">
          {(menuOptions[admin.role] || []).map(option => (
            <button
              key={option.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-sm transition-all text-base font-medium
                ${selectedSection === option.section 
                  ? 'bg-gradient-to-r from-[#7ed6a7]/80 to-[#b8b5ff]/80 text-[#222] shadow-md' 
                  : 'bg-white/60 text-gray-700 hover:bg-[#f6e7cb]/80'}
              `}
              onClick={() => handleMenuClick(option.section)}
            >
              <span className="text-xl">{option.icon}</span> {option.label}
            </button>
          ))}
        </nav>
        <button 
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ffb3ab]/80 text-[#222] rounded-xl shadow-md hover:bg-[#ffb3ab] transition-all font-medium text-base mb-2"
          onClick={onLogout}
        >
          <FiLogOut className="text-lg" /> Cerrar sesión
        </button>
      </aside>
      
      {/* Sidebar móvil mejorado */}
      {sidebarVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`fixed inset-0 transition-all duration-300 ${sidebarOpen ? 'bg-black/40 backdrop-blur-[2px] opacity-100' : 'bg-black/0 opacity-0'}`}
            onClick={closeSidebar}
          ></div>
          <div
            className={`fixed right-0 top-0 h-full w-80 sidebar-blur p-4 flex flex-col gap-4 shadow-xl rounded-l-3xl mt-1 mb-1 mr-1 transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Botón de cerrar visible en móvil */}
            <button
              onClick={closeSidebar}
              aria-label="Cerrar menú"
              className="absolute top-3 right-3 rounded-full p-2 bg-white/90 dark:bg-[#23272b]/90 border border-[#e0e0e0] dark:border-[#3a3f47] shadow hover:bg-[#f0f0f0] dark:hover:bg-[#2d3237] transition"
            >
              <FiX className="text-xl text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="rounded-full bg-gradient-to-br from-[#b8b5ff] to-[#7ed6a7] text-white w-14 h-14 flex items-center justify-center text-2xl font-bold shadow-lg">S</div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">{admin.username}</span>
              <button
                className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 shadow hover:bg-gray-200 transition-all"
                onClick={() => setDarkMode(d => !d)}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
                {darkMode ? 'Claro' : 'Oscuro'}
              </button>
            </div>
            <nav className="flex flex-col gap-3 w-full flex-1">
              {(menuOptions[admin.role] || []).map(option => (
                <button
                  key={option.label}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-sm transition-all text-base font-medium
                    ${selectedSection === option.section 
                      ? 'bg-gradient-to-r from-[#7ed6a7]/80 to-[#b8b5ff]/80 text-[#222] shadow-md' 
                      : 'bg-white/60 text-gray-700 hover:bg-[#f6e7cb]/80'}
                  `}
                  onClick={() => { handleMenuClick(option.section); closeSidebar(); }}
                >
                  <span className="text-xl">{option.icon}</span> {option.label}
                </button>
              ))}
            </nav>
            <button 
              className="mt-auto flex items-center gap-2 px-4 py-2.5 bg-[#ffb3ab]/80 text-[#222] rounded-xl shadow-md hover:bg-[#ffb3ab] transition-all font-medium text-base"
              onClick={onLogout}
            >
              <FiLogOut className="text-lg" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
      
      {/* Botón hamburguesa móvil mejorado */}
      <button 
        className="fixed top-4 right-4 z-40 md:hidden bg-white dark:bg-[#23272b] border border-[#e0e0e0] dark:border-[#3a3f47] rounded-full p-4 shadow-xl backdrop-blur-[8px] hover:bg-[#b8b5ff]/40 dark:hover:bg-[#353a40]/60 transition-all duration-200 hover:scale-105"
        onClick={openSidebar}
        aria-label="Abrir menú"
      >
        <FiMenu className="text-2xl text-[#7ed6a7]" />
      </button>
      
      {/* Contenido principal optimizado para mobile */}
      <main className="flex-1 flex flex-col items-center p-2 sm:p-4 overflow-y-auto md:ml-72 pt-16 md:pt-4">
        <div className="w-full max-w-5xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 