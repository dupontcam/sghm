import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt,
    FaHospital, FaFileInvoiceDollar, FaBell, FaUsersCog
} from 'react-icons/fa';
// Importa o logo
import sghmLogo from '../assets/sghm_logo.png';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const { userProfile, logout, user } = useAuth();

    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                {/* Botão fechar mobile */}
                {onClose && (
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Fechar menu">
                        ✕
                    </button>
                )}
                {/* 1. Usando o Logo */}
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
                <li><NavLink to="/notificacoes" onClick={handleLinkClick}><FaBell /> Notificações</NavLink></li>
                
                {/* Itens que só aparecem para o Admin */}
                {userProfile === 'Admin' && (
                    <>
                        <li><NavLink to="/financeiro" onClick={handleLinkClick}><FaDollarSign /> Controle Financeiro</NavLink></li>
                        <li><NavLink to="/relatorios" onClick={handleLinkClick}><FaChartBar /> Relatórios</NavLink></li>
                        <li><NavLink to="/usuarios" onClick={handleLinkClick}><FaUsersCog /> Gestão de Usuários</NavLink></li>
                        <li><NavLink to="/backup" onClick={handleLinkClick}><FaDatabase /> Backup e Restauração</NavLink></li>
                    </>
                )}

                {/* Rota de Perfil para todos */}
                <li>
                    <NavLink to="/perfil" onClick={handleLinkClick}><FaUser /> Meu Perfil</NavLink>
                </li>
            </ul>

            {/* Rodapé da Sidebar */}
            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        <FaUser />
                    </div>
                    <div className="user-details">
                        <strong>{user?.nome || 'Usuário'}</strong>
                        <span className={`user-badge badge-${userProfile.toLowerCase()}`}>
                            {userProfile}
                        </span>
                    </div>
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <button onClick={handleLogout} className="logout-btn">
                            <FaSignOutAlt /> Sair
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Sidebar;
