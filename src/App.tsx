import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './components/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Dashboard from './components/Dashboard';
import CadastroMedicos from './components/CadastroMedicos';
import CadastroPacientes from './components/CadastroPacientes';
import RegistroConsultas from './components/RegistroConsultas';
import GestaoPlanosSaude from './components/GestaoPlanosSaude';
import GestaoHonorarios from './components/GestaoHonorarios';
import ControleFinanceiro from './components/ControleFinanceiro';
import Relatorios from './components/Relatorios';
import Notifications from './components/Notifications';
import UserProfile from './components/UserProfile';
import Backup from './components/Backup';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider> 
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Navigate replace to="/login" />} />
              <Route path="/login" element={<Login />} />
              
              {/* Rotas Protegidas (requerem autenticação) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  
                  {/* Rotas para TODOS os usuários autenticados */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/consultas" element={<RegistroConsultas />} />
                  <Route path="/medicos" element={<CadastroMedicos />} />
                  <Route path="/pacientes" element={<CadastroPacientes />} />
                  <Route path="/planos-saude" element={<GestaoPlanosSaude />} />
                  <Route path="/honorarios" element={<GestaoHonorarios />} />
                  <Route path="/notificacoes" element={<Notifications />} />
                  <Route path="/perfil" element={<UserProfile />} />
                  
                  {/* Rotas EXCLUSIVAS DO ADMIN */}
                  <Route element={<AdminRoute />}>
                    <Route path="/financeiro" element={<ControleFinanceiro />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/backup" element={<Backup />} />
                  </Route>

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
