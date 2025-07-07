import React, { useState } from 'react';
import styles from './Dashboard.module.css';
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

function Dashboard({ user, onLogout }) {
  // Simulación de usuario si no se pasa por props
  const admin = user || { username: 'admin', role: 'canchas' };

  // Opciones de menú según el rol
  const menuOptions = {
    canchas: [
      { label: 'Inicio', section: 'inicio' },
      { label: 'Reservas', section: 'reservas' },
      { label: 'Horarios', section: 'horarios' },
      { label: 'Mantenimiento', section: 'mantenimiento' },
    ],
    cobranzas: [
      { label: 'Inicio', section: 'inicio' },
      { label: 'Pagos', section: 'pagos' },
      { label: 'Deudas', section: 'deudas' },
      { label: 'Reportes', section: 'reportes' },
    ],
    buffet: [
      { label: 'Inicio', section: 'inicio' },
      { label: 'Stock', section: 'stock' },
      { label: 'Compras', section: 'compras' },
      { label: 'Ventas', section: 'ventas' },
    ],
  };

  // Por defecto, selecciona la primera opción del menú
  const [selectedSection, setSelectedSection] = useState(menuOptions[admin.role]?.[0]?.section || 'inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

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
    if (window.innerWidth <= 700) setSidebarOpen(false);
  };

  // Cierra el sidebar al tocar el overlay en móvil
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={styles.dashboardContainer}>
      {!modalOpen && (
        <button className={styles.hamburger} onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      )}
      {sidebarOpen && <div className={styles.overlay} onClick={handleOverlayClick}></div>}
      <aside className={styles.sidebar + (sidebarOpen ? ' ' + styles.open : '')}>
        <div className={styles.logo}>S</div>
        <div className={styles.userInfo}>
          <span className={styles.username}>{admin.username}</span>
          <span className={styles.role}>{admin.role}</span>
        </div>
        <nav className={styles.menu}>
          {(menuOptions[admin.role] || []).map(option => (
            <button
              key={option.label}
              className={styles.menuBtn + (selectedSection === option.section ? ' ' + styles.activeMenuBtn : '')}
              onClick={() => handleMenuClick(option.section)}
            >
              {option.label}
            </button>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={onLogout}>Cerrar sesión</button>
      </aside>
      <main className={styles.mainContent}>
        <div style={{ width: '100%' }}>
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default Dashboard; 