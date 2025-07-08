import React, { useState, useRef } from 'react';
import CanchasSection from './sections/CanchasSection';
import CobranzasSection from './sections/CobranzasSection';
import BuffetSection from './sections/BuffetSection';
import ReservasSection from './sections/ReservasSection';
import HorariosSection from './sections/HorariosSection';
import MantenimientoSection from './sections/MantenimientoSection';
import PagosSection from './sections/PagosSection';
import DeudasSection from './sections/DeudasSection';
import ReportesSection from './sections/ReportesSection';
import StockSection from './sections/StockSection';
import ComprasSection from './sections/ComprasSection';
import VentasSection from './sections/VentasSection';
import InicioSection from './sections/InicioSection';
import { FiHome, FiCalendar, FiClock, FiTool, FiDollarSign, FiAlertCircle, FiBarChart2, FiBox, FiShoppingCart, FiTrendingUp, FiLogOut } from 'react-icons/fi';

function Dashboard({ user, onLogout }) {
  // Simulación de usuario si no se pasa por props
  const admin = user || { username: 'admin', role: 'canchas' };

  // Opciones de menú según el rol
  const menuOptions = {
    canchas: [
      { label: 'Inicio', section: 'inicio', icon: <FiHome /> },
      { label: 'Reservas', section: 'reservas', icon: <FiCalendar /> },
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
    if (selectedSection === 'inicio') return <InicioSection user={admin} />;
    if (admin.role === 'canchas') {
      if (selectedSection === 'reservas') return <ReservasSection modalOpen={modalOpen} setModalOpen={setModalOpen} />;
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
    <div className="flex min-h-screen bg-gradient-to-br from-[#f7f7f7] to-[#e9ecef]">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex flex-col w-72 sidebar-blur p-6 gap-6 shadow-xl rounded-r-3xl mt-4 mb-4 ml-2">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="rounded-full bg-gradient-to-br from-[#b8b5ff] to-[#7ed6a7] text-white w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-lg">S</div>
          <span className="font-semibold text-gray-900 text-lg">{admin.username}</span>
          <span className="text-xs text-gray-500">{admin.role}</span>
        </div>
        <nav className="flex flex-col gap-3 w-full">
          {(menuOptions[admin.role] || []).map(option => (
            <button
              key={option.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm transition-all text-base font-medium
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
          className="mt-auto flex items-center gap-2 px-4 py-3 bg-[#ffb3ab]/80 text-[#222] rounded-xl shadow-md hover:bg-[#ffb3ab] transition-all font-medium text-base"
          onClick={onLogout}
        >
          <FiLogOut className="text-lg" /> Cerrar sesión
        </button>
      </aside>
      {/* Sidebar móvil glassmorphism */}
      {sidebarVisible && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className={`fixed inset-0 transition-all duration-300 ${sidebarOpen ? 'bg-black/30 backdrop-blur-[2px] opacity-100' : 'bg-black/0 opacity-0'}`}
            onClick={closeSidebar}
          ></div>
          <div
            className={`fixed right-0 top-0 h-full w-72 sidebar-blur p-6 flex flex-col gap-6 shadow-xl rounded-l-3xl mt-4 mb-4 mr-2 transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="rounded-full bg-gradient-to-br from-[#b8b5ff] to-[#7ed6a7] text-white w-16 h-16 flex items-center justify-center text-3xl font-bold shadow-lg">S</div>
              <span className="font-semibold text-gray-900 text-lg">{admin.username}</span>
              <span className="text-xs text-gray-500">{admin.role}</span>
            </div>
            <nav className="flex flex-col gap-3 w-full">
              {(menuOptions[admin.role] || []).map(option => (
                <button
                  key={option.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm transition-all text-base font-medium
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
              className="mt-auto flex items-center gap-2 px-4 py-3 bg-[#ffb3ab]/80 text-[#222] rounded-xl shadow-md hover:bg-[#ffb3ab] transition-all font-medium text-base"
              onClick={onLogout}
            >
              <FiLogOut className="text-lg" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
      {/* Botón hamburguesa móvil flotante glass */}
      <button 
        className="fixed top-4 right-4 z-30 md:hidden bg-white/80 border border-[#e0e0e0] rounded-full p-3 shadow-lg backdrop-blur-[6px] hover:bg-[#b8b5ff]/40 transition-all"
        onClick={openSidebar}
      >
        <span className="text-2xl text-[#7ed6a7]"><FiHome /></span>
      </button>
      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center p-4 overflow-y-auto">
        <div className="w-full max-w-5xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 