import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext'; // Importar o DataProvider
import Login from './components/Login';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute';
import Dashboard from './components/Dashboard';
import CadastroMedicos from './components/CadastroMedicos';
import CadastroPacientes from './components/CadastroPacientes';
import RegistroConsultas from './components/RegistroConsultas';
import ControleFinanceiro from './components/ControleFinanceiro';
import Relatorios from './components/Relatorios';
import UserProfile from './components/UserProfile'; // 1. Importar UserProfile
import Backup from './components/Backup';           // 2. Importar Backup

import './App.css';

function App() {
  return (
    <AuthProvider>
      {/* 3. Envolver as rotas no DataProvider */}
      <DataProvider> 
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Navigate replace to="/login" />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rotas Protegidas (requerem login, envolvem o Layout) */}
              <Route element={<Layout />}>
                
                {/* Rotas para TODOS os usuários logados */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/consultas" element={<RegistroConsultas />} />
                <Route path="/medicos" element={<CadastroMedicos />} />
                <Route path="/pacientes" element={<CadastroPacientes />} />
                <Route path="/perfil" element={<UserProfile />} /> {/* 4. Adicionar rota de Perfil */}
                
                {/* Rotas EXCLUSIVAS DO ADMIN */}
                <Route element={<AdminRoute />}>
                  <Route path="/financeiro" element={<ControleFinanceiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/backup" element={<Backup />} /> {/* 5. Adicionar rota de Backup */}
                </Route>

              </Route>
              
              <Route path="*" element={<Navigate replace to="/login" />} />
            </Routes>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
