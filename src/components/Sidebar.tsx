import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
    FaHome, FaRegListAlt, FaUser, FaUserMd, FaUsers, 
    FaDollarSign, FaChartBar, FaDatabase, FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar: React.FC = () => {
    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h2 className="sidebar-title">SISTEMA DE GERENCIAMENTO<br/>DE HONORÁRIOS MÉDICOS</h2>
                <span className="sidebar-subtitle">DESDE 2021</span>
            </div>
            <ul className="sidebar-menu">
                <li><NavLink to="/dashboard"><FaHome /> Página Inicial</NavLink></li>
                <li><NavLink to="/consultas"><FaRegListAlt /> Registro de Consultas</NavLink></li>
                <li><NavLink to="/medicos"><FaUserMd /> Cadastro de Médicos</NavLink></li>
                <li><NavLink to="/pacientes"><FaUsers /> Cadastro de Pacientes</NavLink></li>
                
                <li className="disabled-link">
                    <NavLink to="#" onClick={(e) => e.preventDefault()}><FaUser /> Perfil do Usuário</NavLink>
                </li>
                <li className="disabled-link">
                    <NavLink to="#" onClick={(e) => e.preventDefault()}><FaDollarSign /> Controle Financeiro</NavLink>
                </li>
                <li className="disabled-link">
                    <NavLink to="#" onClick={(e) => e.preventDefault()}><FaChartBar /> Relatórios</NavLink>
                </li>
                <li className="disabled-link">
                    <NavLink to="#" onClick={(e) => e.preventDefault()}><FaDatabase /> Backup e Restauração</NavLink>
                </li>
                
                <li><NavLink to="/login"><FaSignOutAlt /> Sair</NavLink></li>
            </ul>
        </nav>
    );
};

export default Sidebar;
