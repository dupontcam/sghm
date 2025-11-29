import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  Medico, Paciente, Consulta, PlanoSaude, Honorario, DashboardStats
} from '../data/mockData';
import { 
  medicosAPI, pacientesAPI, consultasAPI, planosAPI, honorariosAPI, estatisticasAPI 
} from '../services/api';

// --- Definição do Tipo do Contexto ---
interface DataContextType {
  // Estado de carregamento
  loading: boolean;
  error: string | null;

  // Médicos
  medicos: Medico[];
  addMedico: (medico: Omit<Medico, 'id'>) => Promise<void>;
  updateMedico: (medico: Medico) => Promise<void>;
  deleteMedico: (id: number) => Promise<boolean>;
  refreshMedicos: () => Promise<void>;
  
  // Pacientes
  pacientes: Paciente[];
  addPaciente: (paciente: Omit<Paciente, 'id'>) => Promise<void>;
  updatePaciente: (paciente: Paciente) => Promise<void>;
  deletePaciente: (id: number) => Promise<boolean>;
  refreshPacientes: () => Promise<void>;

  // Consultas
  // REGRA DE NEGÓCIO: Consultas NÃO podem ser deletadas, apenas criadas e editadas
  // Razão: São a origem dos honorários e precisam manter histórico completo
  consultas: Consulta[];
  addConsulta: (consulta: Omit<Consulta, 'id'>) => Promise<void>;
  addConsultaComHonorario: (consulta: Omit<Consulta, 'id'>) => Promise<void>;
  updateConsulta: (consulta: Consulta) => Promise<void>;
  deleteConsulta: (id: number) => Promise<void>; // Manter na interface por compatibilidade, mas não usar
  refreshConsultas: () => Promise<void>;

  // Planos de Saúde
  planosSaude: PlanoSaude[];
  addPlanoSaude: (plano: Omit<PlanoSaude, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePlanoSaude: (plano: PlanoSaude) => Promise<void>;
  deletePlanoSaude: (id: number) => Promise<boolean>;
  getPlanoSaudeById: (id: number) => PlanoSaude | undefined;
  refreshPlanosSaude: () => Promise<void>;

  // Honorários
  // REGRA DE NEGÓCIO: Honorários NÃO podem ser deletados, apenas atualizados
  // Razão: Preservar histórico completo desde criação até acerto final com médico
  honorarios: Honorario[];
  addHonorario: (honorario: Omit<Honorario, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHonorario: (honorario: Honorario) => Promise<void>;
  deleteHonorario: (id: number) => Promise<void>; // Manter na interface por compatibilidade, mas não usar
  getHonorariosByMedico: (medicoId: number) => Honorario[];
  getHonorariosByPlano: (planoId: number) => Honorario[];
  refreshHonorarios: () => Promise<void>;

  // Dashboard
  getDashboardStats: () => DashboardStats;
  refreshDashboardStats: () => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [planosSaude, setPlanosSaude] = useState<PlanoSaude[]>([]);
  const [honorariosBackend, setHonorariosBackend] = useState<Honorario[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProcessado: 0,
    totalPendente: 0,
    totalPago: 0,
    totalGlosado: 0,
    taxaGlosa: 0,
    quantidadeHonorarios: 0
  });

  // Estado para forçar refresh quando localStorage muda
  const [localStorageVersion, setLocalStorageVersion] = useState(0);

  // Listener para mudanças no localStorage de recursos
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sghm_recursos') {
        setLocalStorageVersion(prev => prev + 1);
      }
    };

    // Custom event para mudanças no mesmo tab
    const handleCustomStorageChange = () => {
      setLocalStorageVersion(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sghm_recursos_updated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sghm_recursos_updated', handleCustomStorageChange);
    };
  }, []);

  // Mescla honorários do backend com dados de recursos do localStorage
  const honorarios = useMemo(() => {
    try {
      const recursosStorage = localStorage.getItem('sghm_recursos');
      if (!recursosStorage) {
        return honorariosBackend;
      }

      const recursos = JSON.parse(recursosStorage);
      
      return honorariosBackend.map(honorario => {
        const recurso = recursos[honorario.id];
        if (recurso) {
          return {
            ...honorario,
            recursoEnviado: recurso.recursoEnviado,
            statusRecurso: recurso.statusRecurso,
            dataRecurso: recurso.dataRecurso,
            motivoRecurso: recurso.motivoRecurso,
            valorRecuperado: recurso.valorRecuperado
          };
        }
        return honorario;
      });
    } catch (err) {
      console.error('❌ Erro ao mesclar honorários com localStorage:', err);
      return honorariosBackend;
    }
  }, [honorariosBackend, localStorageVersion]);

  // --- Funções de Refresh (buscar dados da API) ---
  const refreshMedicos = useCallback(async () => {
    try {
      const data = await medicosAPI.getAll();
      setMedicos(data);
    } catch (err: any) {
      console.error('Erro ao buscar médicos:', err);
      setError(err.message);
    }
  }, []);

  const refreshPacientes = useCallback(async () => {
    try {
      const data = await pacientesAPI.getAll();
      setPacientes(data);
    } catch (err: any) {
      console.error('Erro ao buscar pacientes:', err);
      setError(err.message);
    }
  }, []);

  const refreshConsultas = useCallback(async () => {
    try {
      const data = await consultasAPI.getAll();
      setConsultas(data);
    } catch (err: any) {
      console.error('Erro ao buscar consultas:', err);
      setError(err.message);
    }
  }, []);

  const refreshPlanosSaude = useCallback(async () => {
    try {
      const data = await planosAPI.getAll();
      setPlanosSaude(data);
    } catch (err: any) {
      console.error('Erro ao buscar planos de saúde:', err);
      setError(err.message);
    }
  }, []);

  const refreshHonorarios = useCallback(async () => {
    try {
      const data = await honorariosAPI.getAll();
      setHonorariosBackend(data);
    } catch (err: any) {
      console.error('Erro ao buscar honorários:', err);
      setError(err.message);
    }
  }, []);

  const refreshDashboardStats = useCallback(async () => {
    try {
      const data = await estatisticasAPI.getDashboard();
      setDashboardStats(data);
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err.message);
    }
  }, []);

  // --- Carregamento inicial ---
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Carrega apenas dados essenciais na inicialização
        await Promise.all([
          refreshMedicos(),
          refreshPacientes(),
          refreshPlanosSaude()
        ]);
        
        // Carrega consultas e honorários em segundo plano (não bloqueantes)
        refreshConsultas().catch(err => console.error('Erro ao carregar consultas:', err));
        refreshHonorarios().catch(err => console.error('Erro ao carregar honorários:', err));
      } catch (err: any) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [refreshMedicos, refreshPacientes, refreshConsultas, refreshPlanosSaude, refreshHonorarios]);

  // --- Funções CRUD: Médicos ---
  const addMedico = async (medico: Omit<Medico, 'id'>) => {
    try {
      await medicosAPI.create(medico);
      await refreshMedicos();
    } catch (err: any) {
      console.error('Erro ao adicionar médico:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateMedico = async (medicoAtualizado: Medico) => {
    try {
      await medicosAPI.update(medicoAtualizado.id, medicoAtualizado);
      await refreshMedicos();
    } catch (err: any) {
      console.error('Erro ao atualizar médico:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteMedico = async (id: number): Promise<boolean> => {
    try {
      console.log('🗑️ Deletando médico ID:', id);
      await medicosAPI.delete(id);
      console.log('✅ Médico deletado com sucesso');
      await refreshMedicos();
      console.log('✅ Lista de médicos atualizada');
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao excluir médico:', err);
      console.error('❌ Mensagem do erro:', err.message);
      setError(err.message);
      return false;
    }
  };

  // --- Funções CRUD: Pacientes ---
  const addPaciente = async (paciente: Omit<Paciente, 'id'>) => {
    try {
      await pacientesAPI.create(paciente);
      await refreshPacientes();
    } catch (err: any) {
      console.error('Erro ao adicionar paciente:', err);
      setError(err.message);
      throw err;
    }
  };

  const updatePaciente = async (pacienteAtualizado: Paciente) => {
    try {
      await pacientesAPI.update(pacienteAtualizado.id, pacienteAtualizado);
      await refreshPacientes();
    } catch (err: any) {
      console.error('Erro ao atualizar paciente:', err);
      setError(err.message);
      throw err;
    }
  };

  const deletePaciente = async (id: number): Promise<boolean> => {
    try {
      console.log('🗑️ Deletando paciente ID:', id);
      await pacientesAPI.delete(id);
      console.log('✅ Paciente deletado com sucesso');
      await refreshPacientes();
      console.log('✅ Lista de pacientes atualizada');
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao excluir paciente:', err);
      console.error('❌ Mensagem do erro:', err.message);
      setError(err.message);
      return false;
    }
  };

  // --- Funções CRUD: Consultas ---
  const addConsulta = async (consulta: Omit<Consulta, 'id'>) => {
    try {
      await consultasAPI.create(consulta);
      await refreshConsultas();
    } catch (err: any) {
      console.error('Erro ao adicionar consulta:', err);
      setError(err.message);
      throw err;
    }
  };

  // Nova função para criar consulta com honorário automático
  const addConsultaComHonorario = async (consulta: Omit<Consulta, 'id'>) => {
    try {
      // O backend criará o honorário automaticamente
      await consultasAPI.create(consulta);
      await Promise.all([refreshConsultas(), refreshHonorarios()]);
    } catch (err: any) {
      console.error('Erro ao adicionar consulta com honorário:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateConsulta = async (consultaAtualizada: Consulta) => {
    try {
      await consultasAPI.update(consultaAtualizada.id, consultaAtualizada);
      await refreshConsultas();
    } catch (err: any) {
      console.error('Erro ao atualizar consulta:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteConsulta = async (id: number) => {
    try {
      await consultasAPI.delete(id);
      await refreshConsultas();
    } catch (err: any) {
      console.error('Erro ao excluir consulta:', err);
      setError(err.message);
      throw err;
    }
  };

  // --- Funções CRUD: Planos de Saúde ---
  const addPlanoSaude = async (plano: Omit<PlanoSaude, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await planosAPI.create(plano);
      await refreshPlanosSaude();
    } catch (err: any) {
      console.error('Erro ao adicionar plano de saúde:', err);
      setError(err.message);
      throw err;
    }
  };

  const updatePlanoSaude = async (planoAtualizado: PlanoSaude) => {
    try {
      await planosAPI.update(planoAtualizado.id, planoAtualizado);
      await refreshPlanosSaude();
    } catch (err: any) {
      console.error('Erro ao atualizar plano de saúde:', err);
      setError(err.message);
      throw err;
    }
  };

  const deletePlanoSaude = async (id: number): Promise<boolean> => {
    try {
      await planosAPI.delete(id);
      await refreshPlanosSaude();
      return true;
    } catch (err: any) {
      console.error('Erro ao excluir plano de saúde:', err);
      setError(err.message);
      return false;
    }
  };

  const getPlanoSaudeById = (id: number): PlanoSaude | undefined => {
    return planosSaude.find(p => p.id === id);
  };

  // --- Funções CRUD: Honorários ---
  const addHonorario = async (honorario: Omit<Honorario, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await honorariosAPI.create(honorario);
      await refreshHonorarios();
    } catch (err: any) {
      console.error('Erro ao adicionar honorário:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateHonorario = async (honorarioAtualizado: Honorario) => {
    try {
      console.log('📝 Atualizando honorário ID:', honorarioAtualizado.id);
      console.log('📝 Dados do honorário:', honorarioAtualizado);
      await honorariosAPI.update(honorarioAtualizado.id, honorarioAtualizado);
      console.log('✅ Honorário atualizado com sucesso');
      await refreshHonorarios();
      console.log('✅ Lista de honorários atualizada');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar honorário:', err);
      console.error('❌ Mensagem do erro:', err.message);
      setError(err.message);
      throw err;
    }
  };

  const deleteHonorario = async (id: number) => {
    try {
      await honorariosAPI.delete(id);
      await refreshHonorarios();
    } catch (err: any) {
      console.error('Erro ao excluir honorário:', err);
      setError(err.message);
      throw err;
    }
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
    // Recalcular com base nos honorários atuais
    const totalProcessado = honorarios.reduce((acc, h) => acc + h.valor, 0);
    const totalPendente = honorarios.filter(h => h.status === 'PENDENTE').reduce((acc, h) => acc + h.valor, 0);
    const totalPago = honorarios.filter(h => h.status === 'PAGO').reduce((acc, h) => acc + (h.valor - (h.valorGlosa || 0)), 0);
    const totalGlosado = honorarios.reduce((acc, h) => acc + (h.valorGlosa || 0), 0);
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
    loading,
    error,
    // Médicos
    medicos, addMedico, updateMedico, deleteMedico, refreshMedicos,
    // Pacientes
    pacientes, addPaciente, updatePaciente, deletePaciente, refreshPacientes,
    // Consultas
    consultas, addConsulta, addConsultaComHonorario, updateConsulta, deleteConsulta, refreshConsultas,
    // Planos de Saúde
    planosSaude, addPlanoSaude, updatePlanoSaude, deletePlanoSaude, getPlanoSaudeById, refreshPlanosSaude,
    // Honorários
    honorarios, addHonorario, updateHonorario, deleteHonorario, 
    getHonorariosByMedico, getHonorariosByPlano, refreshHonorarios,
    // Dashboard
    getDashboardStats, refreshDashboardStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
