import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa o Provedor de Autenticação
import { AuthProvider } from './contexts/AuthContext';

// Importa os componentes
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CadastroMedicos from './components/CadastroMedicos';
import CadastroPacientes from './components/CadastroPacientes';
import RegistroConsultas from './components/RegistroConsultas';
import './App.css';

function App() {
  return (
    // Envolvemos toda a aplicação (incluindo o Router) com o AuthProvider
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate replace to="/login" />} />
            <Route path="/login" element={<Login />} />
            
            {/* O Layout e todas as rotas filhas agora podem acessar o AuthContext */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/medicos" element={<CadastroMedicos />} />
              <Route path="/pacientes" element={<CadastroPacientes />} />
              <Route path="/consultas" element={<RegistroConsultas />} />
              {/* Adicione as outras rotas (financeiro, relatorios, etc.) aqui */}
            </Route>
            
            <Route path="*" element={<Navigate replace to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
