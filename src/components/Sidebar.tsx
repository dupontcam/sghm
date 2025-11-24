import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt,
    FaHospital, FaFileInvoiceDollar, FaBell
} from 'react-icons/fa';
// Importa o logo
import sghmLogo from '../assets/sghm_logo.png';

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
    const { userProfile, toggleProfile } = useAuth();

    const handleLinkClick = () => {
        if (onClose) onClose();
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
                        <li><NavLink to="/backup" onClick={handleLinkClick}><FaDatabase /> Backup e Restauração</NavLink></li>
                    </>
                )}

                {/* Rota de Perfil para todos */}
                <li>
                    <NavLink to="/perfil" onClick={handleLinkClick}><FaUser /> Perfil do Usuário</NavLink>
                </li>
            </ul>

            {/* Rodapé da Sidebar */}
            <div className="sidebar-footer">
                <ul className="sidebar-menu">
                    <li><a href="/login"><FaSignOutAlt /> Sair</a></li>
                </ul>
                <button className="profile-switcher" onClick={toggleProfile}>
                    Simular Perfil: <strong>{userProfile}</strong>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
