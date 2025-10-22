import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import CadastroMedicos from './components/CadastroMedicos';
import CadastroPacientes from './components/CadastroPacientes';
import RegistroConsultas from './components/RegistroConsultas';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/medicos" element={<CadastroMedicos />} />
            <Route path="/pacientes" element={<CadastroPacientes />} />
            <Route path="/consultas" element={<RegistroConsultas />} />
          </Route>
          
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

