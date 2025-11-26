import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { notificacoesService } from '../services/notificacoesService';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt,
    FaHospital, FaFileInvoiceDollar, FaBell, FaUsersCog, FaStar
} from 'react-icons/fa';
// Importa o logo
import sghmLogo from '../assets/sghm_logo.png';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const { userProfile, logout, user } = useAuth();
    const [notificacoesCount, setNotificacoesCount] = useState(0);

    // Atualizar contador de notificações
    useEffect(() => {
        const updateCount = () => {
            setNotificacoesCount(notificacoesService.contarNaoLidas());
        };

        updateCount(); // Atualizar inicialmente
        
        // Atualizar quando houver mudanças
        const interval = setInterval(updateCount, 2000); // A cada 2 segundos
        window.addEventListener('notificacoesUpdated', updateCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notificacoesUpdated', updateCount);
        };
    }, []);

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <nav className="sidebar">
            {/* Botão fechar mobile */}
            {onClose && (
                <button className="sidebar-close-btn" onClick={onClose} aria-label="Fechar menu">
                    ✕
                </button>
            )}
            
            {/* Informações do usuário no topo */}
            <div className="user-info-top">
                <div className="user-avatar-top">
                    <FaUser />
                </div>
                <div className="user-details-top">
                    <strong>{user?.nome || 'Usuário'}</strong>
                    <span className={`user-badge badge-${userProfile.toLowerCase()}`}>
                        {userProfile}
                    </span>
                </div>
            </div>
            
            <div className="sidebar-header">
                {/* Logo */}
                <img src={sghmLogo} alt="SGHM Logo" className="sidebar-logo" />
            </div>
            
            {/* Menu Principal */}
            <ul className="sidebar-menu">
                <li><NavLink to="/dashboard" onClick={handleLinkClick}><FaHome /> Dashboard</NavLink></li>
                <li><NavLink to="/consultas" onClick={handleLinkClick}><FaRegListAlt /> Registro de Consultas</NavLink></li>
                <li><NavLink to="/medicos" onClick={handleLinkClick}><FaUserMd /> Cadastro de Médicos</NavLink></li>
                <li><NavLink to="/pacientes" onClick={handleLinkClick}><FaUsers /> Cadastro de Pacientes</NavLink></li>
                
                {/* Novos itens do sistema de honorários */}
                <li><NavLink to="/planos-saude" onClick={handleLinkClick}><FaHospital /> Planos de Saúde</NavLink></li>
                <li><NavLink to="/honorarios" onClick={handleLinkClick}><FaFileInvoiceDollar /> Gestão de Honorários</NavLink></li>
                <li>
                    <NavLink to="/notificacoes" onClick={handleLinkClick}>
                        <FaBell /> Notificações
                        {notificacoesCount > 0 && (
                            <span className="notification-badge">{notificacoesCount}</span>
                        )}
                    </NavLink>
                </li>
                <li><NavLink to="/satisfacao" onClick={handleLinkClick}><FaStar /> Satisfação</NavLink></li>
                
                {/* Itens que só aparecem para o Admin */}
                {userProfile === 'Admin' && (
                    <>
                        <li><NavLink to="/financeiro" onClick={handleLinkClick}><FaDollarSign /> Controle Financeiro</NavLink></li>
                        <li><NavLink to="/relatorios" onClick={handleLinkClick}><FaChartBar /> Relatórios</NavLink></li>
                        <li><NavLink to="/usuarios" onClick={handleLinkClick}><FaUsersCog /> Gestão de Usuários</NavLink></li>
                    </>
                )}

                {/* Rota de Perfil para todos */}
                <li>
                    <NavLink to="/perfil" onClick={handleLinkClick}><FaUser /> Meu Perfil</NavLink>
                </li>
                
                {/* Backup e Restauração (apenas Admin) */}
                {userProfile === 'Admin' && (
                    <li><NavLink to="/backup" onClick={handleLinkClick}><FaDatabase /> Backup e Restauração</NavLink></li>
                )}
            </ul>

            {/* Rodapé da Sidebar */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> Sair
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
