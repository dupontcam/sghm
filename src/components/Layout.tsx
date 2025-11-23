import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-container">
      {/* Botão Hambúrguer Mobile */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar} aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay para fechar sidebar ao clicar fora */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar com classe condicional */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={closeSidebar} />
      </div>

      <main className="content-area">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;
