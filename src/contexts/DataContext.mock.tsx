import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Medico, mockMedicos, 
  Paciente, mockPacientes, 
  Consulta, mockConsultas,
  PlanoSaude, mockPlanosSaude,
  Honorario, mockHonorarios,
  DashboardStats
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
  deleteMedico: (id: number) => boolean;
  
  // Pacientes
  pacientes: Paciente[];
  addPaciente: (paciente: Omit<Paciente, 'id'>) => void;
  updatePaciente: (paciente: Paciente) => void;
  deletePaciente: (id: number) => boolean;

  // Consultas
  consultas: Consulta[];
  addConsulta: (consulta: Omit<Consulta, 'id'>) => void;
  addConsultaComHonorario: (consulta: Omit<Consulta, 'id'>) => void;
  updateConsulta: (consulta: Consulta) => void;
  deleteConsulta: (id: number) => void;

  // Planos de Saúde
  planosSaude: PlanoSaude[];
  addPlanoSaude: (plano: Omit<PlanoSaude, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlanoSaude: (plano: PlanoSaude) => void;
  deletePlanoSaude: (id: number) => boolean;
  getPlanoSaudeById: (id: number) => PlanoSaude | undefined;

  // Honorários
  honorarios: Honorario[];
  addHonorario: (honorario: Omit<Honorario, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHonorario: (honorario: Honorario) => void;
  deleteHonorario: (id: number) => void;
  getHonorariosByMedico: (medicoId: number) => Honorario[];
  getHonorariosByPlano: (planoId: number) => Honorario[];

  // Dashboard
  getDashboardStats: () => DashboardStats;
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
  const [planosSaude, setPlanosSaude] = useState<PlanoSaude[]>(mockPlanosSaude);
  const [honorarios, setHonorarios] = useState<Honorario[]>(mockHonorarios);

  // --- Funções CRUD: Médicos ---
  const addMedico = (medico: Omit<Medico, 'id'>) => {
    const novoMedico = { ...medico, id: getNextId(medicos) };
    setMedicos([...medicos, novoMedico]);
  };

  const updateMedico = (medicoAtualizado: Medico) => {
    setMedicos(medicos.map(m => (m.id === medicoAtualizado.id ? medicoAtualizado : m)));
  };

  const deleteMedico = (id: number): boolean => { 
    const consultasAssociadas = consultas.some(c => c.medicoId === id);
    if (consultasAssociadas) {
      console.warn(`Tentativa de excluir Médico ID ${id} bloqueada: Existem consultas associadas.`);
      return false;
    }
    
    setMedicos(medicos.filter((m: Medico) => m.id !== id));
    return true;
  };

  // --- Funções CRUD: Pacientes ---
  const addPaciente = (paciente: Omit<Paciente, 'id'>) => {
    const novoPaciente = { ...paciente, id: getNextId(pacientes) };
    setPacientes([...pacientes, novoPaciente]);
  };

  const updatePaciente = (pacienteAtualizado: Paciente) => {
    setPacientes(pacientes.map(p => (p.id === pacienteAtualizado.id ? pacienteAtualizado : p)));
  };

  const deletePaciente = (id: number): boolean => {
    const consultasAssociadas = consultas.some(c => c.pacienteId === id);
    if (consultasAssociadas) {
      console.warn(`Tentativa de excluir Paciente ID ${id} bloqueada: Existem consultas associadas.`);
      return false;
    }

    setPacientes(pacientes.filter((p: Paciente) => p.id !== id));
    return true;
  };

  // --- Funções CRUD: Consultas ---
  const addConsulta = (consulta: Omit<Consulta, 'id'>) => {
    const novaConsulta = { ...consulta, id: getNextId(consultas) };
    setConsultas([...consultas, novaConsulta]);
  };

  // Nova função para criar consulta com honorário automático
  const addConsultaComHonorario = (consulta: Omit<Consulta, 'id'>) => {
    const novaConsulta = { ...consulta, id: getNextId(consultas) };
    setConsultas(prev => [...prev, novaConsulta]);

    // Criar honorário automaticamente se for por convênio
    if (consulta.tipoPagamento === 'convenio') {
      // Buscar paciente para obter convênio
      const paciente = pacientes.find(p => p.id === consulta.pacienteId);
      
      if (paciente) {
        // Buscar plano de saúde pelo nome do convênio
        const plano = planosSaude.find(p => 
          p.nome.toLowerCase().includes(paciente.convenio.toLowerCase()) ||
          paciente.convenio.toLowerCase().includes(p.nome.toLowerCase())
        );

        if (plano) {
          // Criar honorário
          const novoHonorario: Omit<Honorario, 'id' | 'createdAt' | 'updatedAt'> = {
            medicoId: consulta.medicoId,
            consultaId: novaConsulta.id,
            planoSaudeId: plano.id,
            dataConsulta: consulta.dataConsulta,
            valor: consulta.valorProcedimento,
            status: 'PENDENTE',
            motivoGlosa: `Honorário automático da consulta ${consulta.protocolo} - ${consulta.especialidade}`
          };

          // Adicionar o honorário usando a função existente
          addHonorario(novoHonorario);

          console.log(`✅ Honorário criado automaticamente para consulta ${consulta.protocolo}`);
        } else {
          console.warn(`⚠️ Plano de saúde não encontrado para o convênio: ${paciente.convenio}`);
        }
      }
    } else {
      console.log(`ℹ️ Consulta particular criada - honorário não gerado automaticamente`);
    }
  };

  const updateConsulta = (consultaAtualizada: Consulta) => {
    setConsultas(consultas.map(c => (c.id === consultaAtualizada.id ? consultaAtualizada : c)));
  };

  const deleteConsulta = (id: number) => {
    setConsultas(consultas.filter((c: Consulta) => c.id !== id));
  };

  // --- Funções CRUD: Planos de Saúde ---
  const addPlanoSaude = (plano: Omit<PlanoSaude, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const novoPlano = { 
      ...plano, 
      id: getNextId(planosSaude), 
      createdAt: now,
      updatedAt: now
    };
    setPlanosSaude([...planosSaude, novoPlano]);
  };

  const updatePlanoSaude = (planoAtualizado: PlanoSaude) => {
    const planoComDataAtualizacao = {
      ...planoAtualizado,
      updatedAt: new Date().toISOString()
    };
    setPlanosSaude(planosSaude.map(p => (p.id === planoAtualizado.id ? planoComDataAtualizacao : p)));
  };

  const deletePlanoSaude = (id: number): boolean => {
    const honorariosAssociados = honorarios.some(h => h.planoSaudeId === id);
    if (honorariosAssociados) {
      console.warn(`Tentativa de excluir Plano de Saúde ID ${id} bloqueada: Existem honorários associados.`);
      return false;
    }
    
    setPlanosSaude(planosSaude.filter(p => p.id !== id));
    return true;
  };

  const getPlanoSaudeById = (id: number): PlanoSaude | undefined => {
    return planosSaude.find(p => p.id === id);
  };

  // --- Funções CRUD: Honorários ---
  const addHonorario = (honorario: Omit<Honorario, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const novoHonorario = { 
      ...honorario, 
      id: getNextId(honorarios), 
      createdAt: now,
      updatedAt: now
    };
    setHonorarios([...honorarios, novoHonorario]);
  };

  const updateHonorario = (honorarioAtualizado: Honorario) => {
    const honorarioComDataAtualizacao = {
      ...honorarioAtualizado,
      updatedAt: new Date().toISOString()
    };
    setHonorarios(honorarios.map(h => (h.id === honorarioAtualizado.id ? honorarioComDataAtualizacao : h)));
  };

  const deleteHonorario = (id: number) => {
    setHonorarios(honorarios.filter(h => h.id !== id));
  };

  // --- Funções de Consulta ---
  const getHonorariosByMedico = (medicoId: number): Honorario[] => {
    return honorarios.filter(h => h.medicoId === medicoId);
  };

  const getHonorariosByPlano = (planoId: number): Honorario[] => {
    return honorarios.filter(h => h.planoSaudeId === planoId);
  };

  // --- Função Dashboard ---
  const getDashboardStats = (): DashboardStats => {
    const totalProcessado = honorarios.reduce((acc, h) => acc + h.valor, 0);
    const totalPendente = honorarios.filter(h => h.status === 'PENDENTE').reduce((acc, h) => acc + h.valor, 0);
    const totalPago = honorarios.filter(h => h.status === 'PAGO').reduce((acc, h) => acc + h.valor, 0);
    const totalGlosado = honorarios.filter(h => h.status === 'GLOSADO').reduce((acc, h) => acc + h.valor, 0);
    const taxaGlosa = totalProcessado > 0 ? (totalGlosado / totalProcessado) * 100 : 0;
    const quantidadeHonorarios = honorarios.length;

    return {
      totalProcessado,
      totalPendente,
      totalPago,
      totalGlosado,
      taxaGlosa,
      quantidadeHonorarios
    };
  };

  // --- Valor do Contexto ---
  const value = {
    medicos, addMedico, updateMedico, deleteMedico,
    // Pacientes
    pacientes, addPaciente, updatePaciente, deletePaciente,
    // Consultas
    consultas, addConsulta, addConsultaComHonorario, updateConsulta, deleteConsulta,
    // Planos de Saúde
    planosSaude, addPlanoSaude, updatePlanoSaude, deletePlanoSaude, getPlanoSaudeById,
    // Honorários
    honorarios, addHonorario, updateHonorario, deleteHonorario, 
    getHonorariosByMedico, getHonorariosByPlano,
    // Dashboard
    getDashboardStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};