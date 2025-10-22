import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt, FaSyncAlt
} from 'react-icons/fa';

// Importa o hook de autenticação
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
    // Acessa o perfil atual e a função de toggle
    const { userProfile, toggleProfile } = useAuth();

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">SISTEMA DE GERENCIAMENTO<br/>DE HONORÁRIOS MÉDICOS</h2>
                <span className="sidebar-subtitle">DESDE 2021</span>
            </div>
            
            {/* Menu principal */}
            <ul className="sidebar-menu">
                <li><NavLink to="/dashboard"><FaHome /> Página Inicial</NavLink></li>
                <li><NavLink to="/consultas"><FaRegListAlt /> Registro de Consultas</NavLink></li>
                <li className="disabled-link"><NavLink to="/perfil"><FaUser /> Perfil do Usuário</NavLink></li>
                <li><NavLink to="/medicos"><FaUserMd /> Cadastro de Médicos</NavLink></li>
                <li><NavLink to="/pacientes"><FaUsers /> Cadastro de Pacientes</NavLink></li>
                
                {userProfile === 'Admin' && (
                    <>
                        <li className="disabled-link"><NavLink to="/financeiro"><FaDollarSign /> Controle Financeiro</NavLink></li>
                        <li className="disabled-link"><NavLink to="/relatorios"><FaChartBar /> Relatórios</NavLink></li>
                        <li className="disabled-link"><NavLink to="/backup"><FaDatabase /> Backup e Restauração</NavLink></li>
                    </>
                )}
            </ul>

            {/* Rodapé da Sidebar */}
            <div className="sidebar-footer">
                {/* O botão "Sair" agora vem primeiro (mais acima) */}
                <ul className="sidebar-menu">
                     <li><a href="/login"><FaSignOutAlt /> Sair</a></li>
                </ul>

                {/* O botão de simulação agora é o último item (mais abaixo) */}
                <button className="profile-switcher" onClick={toggleProfile}>
                    <FaSyncAlt /> 
                    Simular Perfil: <strong>{userProfile}</strong>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;