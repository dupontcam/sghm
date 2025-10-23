import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext'; // <-- 1. Importar o DataProvider
import Login from './components/Login';
import Layout from './components/Layout';
import AdminRoute from './components/AdminRoute'; 
import Dashboard from './components/Dashboard';
import CadastroMedicos from './components/CadastroMedicos';
import CadastroPacientes from './components/CadastroPacientes';
import RegistroConsultas from './components/RegistroConsultas';
import ControleFinanceiro from './components/ControleFinanceiro';
import Relatorios from './components/Relatorios';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider> {/* <-- 2. Envolver o Router com o DataProvider */}
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
                <Route path="/medicos" element={<CadastroMedicos />} />
                <Route path="/pacientes" element={<CadastroPacientes />} />
                <Route path="/consultas" element={<RegistroConsultas />} />
                
                {/* Rotas EXCLUSIVAS DO ADMIN */}
                <Route element={<AdminRoute />}> 
                  <Route path="/financeiro" element={<ControleFinanceiro />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  {/* <Route path="/backup" element={...} /> */}
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