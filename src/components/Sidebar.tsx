import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
    const { userProfile, toggleProfile } = useAuth();

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">SISTEMA DE GERENCIAMENTO<br/>DE HONORÁRIOS MÉDICOS</h2>
                <span className="sidebar-subtitle">DESDE 2021</span>
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
                        <li>
                            <NavLink to="/financeiro"><FaDollarSign /> Controle Financeiro</NavLink>
                        </li>
                        <li>
                            <NavLink to="/relatorios"><FaChartBar /> Relatórios</NavLink>
                        </li>
                        {/* 1. Ativando o link de Backup */}
                        <li>
                            <NavLink to="/backup"><FaDatabase /> Backup e Restauração</NavLink>
                        </li>
                    </>
                )}

                {/* 2. Ativando o link de Perfil (visível para todos) */}
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

