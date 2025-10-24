import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt 
} from 'react-icons/fa';
// Importa o logo
import sghmLogo from '../assets/sghm_logo.png';

const Sidebar: React.FC = () => {
    const { userProfile, toggleProfile } = useAuth();

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                {/* 1. Usando o Logo */}
                <img src={sghmLogo} alt="SGHM Logo" className="sidebar-logo" />
            </div>
            
            {/* Menu Principal */}
            <ul className="sidebar-menu">
                <li><NavLink to="/dashboard"><FaHome /> Página Inicial</NavLink></li>
                <li><NavLink to="/consultas"><FaRegListAlt /> Registro de Consultas</NavLink></li>
                <li><NavLink to="/medicos"><FaUserMd /> Cadastro de Médicos</NavLink></li>
                <li><NavLink to="/pacientes"><FaUsers /> Cadastro de Pacientes</NavLink></li>
                
                {/* Itens que só aparecem para o Admin */}
                {userProfile === 'Admin' && (
                    <>
                        <li><NavLink to="/financeiro"><FaDollarSign /> Controle Financeiro</NavLink></li>
                        <li><NavLink to="/relatorios"><FaChartBar /> Relatórios</NavLink></li>
                        <li><NavLink to="/backup"><FaDatabase /> Backup e Restauração</NavLink></li>
                    </>
                )}

                {/* Rota de Perfil para todos */}
                <li>
                    <NavLink to="/perfil"><FaUser /> Perfil do Usuário</NavLink>
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
