import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Medico, mockMedicos, 
  Paciente, mockPacientes, 
  Consulta, mockConsultas 
} from '../data/mockData';

// --- Helper para gerar novo ID ---
const getNextId = <T extends { id: number }>(items: T[]): number => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// --- Definição do Tipo do Contexto ---
interface DataContextType {
  // Médicos
  medicos: Medico[];
  addMedico: (medico: Omit<Medico, 'id'>) => void;
  updateMedico: (medico: Medico) => void;
  deleteMedico: (id: number) => boolean; // 1. MUDANÇA: Retorna boolean
  
  // Pacientes
  pacientes: Paciente[];
  addPaciente: (paciente: Omit<Paciente, 'id'>) => void;
  updatePaciente: (paciente: Paciente) => void;
  deletePaciente: (id: number) => boolean; // 2. MUDANÇA: Retorna boolean

  // Consultas
  consultas: Consulta[];
  addConsulta: (consulta: Omit<Consulta, 'id'>) => void;
  updateConsulta: (consulta: Consulta) => void;
  deleteConsulta: (id: number) => void;
}

// --- Criação do Contexto ---
const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Hook de Consumo ---
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};

// --- Componente Provedor ---
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // --- Estados ---
  const [medicos, setMedicos] = useState<Medico[]>(mockMedicos);
  const [pacientes, setPacientes] = useState<Paciente[]>(mockPacientes);
  const [consultas, setConsultas] = useState<Consulta[]>(mockConsultas);

  // --- Funções CRUD: Médicos ---
  const addMedico = (medico: Omit<Medico, 'id'>) => {
    const novoMedico = { ...medico, id: getNextId(medicos) };
    setMedicos([...medicos, novoMedico]);
  };

  const updateMedico = (medicoAtualizado: Medico) => {
    setMedicos(medicos.map(m => (m.id === medicoAtualizado.id ? medicoAtualizado : m)));
  };

  // 3. ATUALIZAÇÃO DA LÓGICA
  const deleteMedico = (id: number): boolean => { 
    const consultasAssociadas = consultas.some(c => c.medicoId === id);
    if (consultasAssociadas) {
      console.warn(`Tentativa de excluir Médico ID ${id} bloqueada: Existem consultas associadas.`);
      return false; // Retorna 'false' (falha)
    }
    
    setMedicos(medicos.filter((m: Medico) => m.id !== id));
    return true; // Retorna 'true' (sucesso)
  };

  // --- Funções CRUD: Pacientes ---
  const addPaciente = (paciente: Omit<Paciente, 'id'>) => {
    const novoPaciente = { ...paciente, id: getNextId(pacientes) };
    setPacientes([...pacientes, novoPaciente]);
  };

  const updatePaciente = (pacienteAtualizado: Paciente) => {
    setPacientes(pacientes.map(p => (p.id === pacienteAtualizado.id ? pacienteAtualizado : p)));
  };

  // 4. ATUALIZAÇÃO DA LÓGICA
  const deletePaciente = (id: number): boolean => {
    const consultasAssociadas = consultas.some(c => c.pacienteId === id);
    if (consultasAssociadas) {
      console.warn(`Tentativa de excluir Paciente ID ${id} bloqueada: Existem consultas associadas.`);
      return false; // Retorna 'false' (falha)
    }

    setPacientes(pacientes.filter((p: Paciente) => p.id !== id));
    return true; // Retorna 'true' (sucesso)
  };

  // --- Funções CRUD: Consultas ---
  const addConsulta = (consulta: Omit<Consulta, 'id'>) => {
    const novaConsulta = { ...consulta, id: getNextId(consultas) };
    setConsultas([...consultas, novaConsulta]);
  };

  const updateConsulta = (consultaAtualizada: Consulta) => {
    setConsultas(consultas.map(c => (c.id === consultaAtualizada.id ? consultaAtualizada : c)));
  };

  const deleteConsulta = (id: number) => {
    setConsultas(consultas.filter((c: Consulta) => c.id !== id));
  };

  // --- Valor do Contexto ---
  const value = {
    medicos, addMedico, updateMedico, deleteMedico,
    pacientes, addPaciente, updatePaciente, deletePaciente,
    consultas, addConsulta, updateConsulta, deleteConsulta
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
