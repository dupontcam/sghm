// Configuração da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Gerenciamento de Token
const TOKEN_KEY = 'sghm_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
};

// Helper para fazer requisições
const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const token = tokenManager.getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    const errorMessage = error.error || error.message || `Erro ${response.status}`;
    console.error('Erro na API:', { endpoint, status: response.status, error });
    throw new Error(errorMessage);
  }

  return response.json();
};

// --- Transformadores de dados ---
const transformMedicoToBackend = (medico: any) => ({
  nome_medico: medico.nome,
  especialidade: medico.especialidade,
  crm: medico.crm,
  cnpj_cpf: medico.cpf,
  email: medico.email,
  telefone: medico.telefone,
});

const transformMedicoFromBackend = (medico: any) => ({
  id: medico.id,
  nome: medico.nome_medico,
  especialidade: medico.especialidade,
  crm: medico.crm,
  cpf: medico.cnpj_cpf,
  email: medico.email,
  telefone: medico.telefone,
});

// --- API de Médicos ---
export const medicosAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI('/medicos');
      const data = response.data || response;
      return Array.isArray(data) ? data.map(transformMedicoFromBackend) : [];
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock para médicos');
      const { mockMedicos } = await import('../data/mockData');
      return mockMedicos;
    }
  },
  getById: async (id: number) => {
    const data = await fetchAPI(`/medicos/${id}`);
    return transformMedicoFromBackend(data);
  },
  create: (data: any) => 
    fetchAPI('/medicos', { 
      method: 'POST', 
      body: JSON.stringify(transformMedicoToBackend(data)) 
    }).then(transformMedicoFromBackend),
  update: (id: number, data: any) => 
    fetchAPI(`/medicos/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(transformMedicoToBackend(data)) 
    }).then(transformMedicoFromBackend),
  delete: (id: number) => fetchAPI(`/medicos/${id}`, { method: 'DELETE' }),
};

const transformPacienteToBackend = (paciente: any) => ({
  nome_paciente: paciente.nome,
  data_nascimento: paciente.dataNascimento || null,
  cpf: paciente.cpf,
  email: paciente.email,
  telefone: paciente.telefone,
  convenio: paciente.convenio || null,
  numero_carteirinha: paciente.carteirinha || null,
});

const transformPacienteFromBackend = (paciente: any) => ({
  id: paciente.id,
  nome: paciente.nome_paciente,
  dataNascimento: paciente.data_nascimento,
  cpf: paciente.cpf,
  email: paciente.email,
  telefone: paciente.telefone,
  convenio: paciente.convenio || '',
  carteirinha: paciente.numero_carteirinha || '',
});

// --- API de Pacientes ---
export const pacientesAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI('/pacientes');
      const data = response.data || response;
      return Array.isArray(data) ? data.map(transformPacienteFromBackend) : [];
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock para pacientes');
      const { mockPacientes } = await import('../data/mockData');
      return mockPacientes;
    }
  },
  getById: async (id: number) => {
    const data = await fetchAPI(`/pacientes/${id}`);
    return transformPacienteFromBackend(data);
  },
  create: (data: any) => 
    fetchAPI('/pacientes', { 
      method: 'POST', 
      body: JSON.stringify(transformPacienteToBackend(data)) 
    }).then(transformPacienteFromBackend),
  update: (id: number, data: any) => 
    fetchAPI(`/pacientes/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(transformPacienteToBackend(data)) 
    }).then(transformPacienteFromBackend),
  delete: (id: number) => fetchAPI(`/pacientes/${id}`, { method: 'DELETE' }),
};

const transformConsultaToBackend = (consulta: any) => {
  // Mapear status do frontend para o backend
  const statusMap: Record<string, string> = {
    'Pendente': 'PENDENTE',
    'Pago': 'PAGO',
    'Glosado': 'GLOSA'
  };

  const payload: any = {
    data_consulta: consulta.dataConsulta,
    protocolo: consulta.protocolo,
    consultorio: consulta.consultorio,
    tipo_local: consulta.tipoLocal || null,
    tipo_pagamento: consulta.tipoPagamento === 'particular' ? 'PARTICULAR' : 'PLANO_SAUDE',
    status_pagamento: statusMap[consulta.status] || 'PENDENTE',
    valor_bruto: consulta.valorProcedimento,
    descricao_procedimento: consulta.descricaoProcedimento,
    medico_id: consulta.medicoId,
    paciente_id: consulta.pacienteId,
    plano_saude_id: consulta.planoSaudeId || null,
    numero_carteirinha: consulta.numeroCarteirinha || null,
  };

  // Adiciona campos de pagamento se status for Pago
  if (consulta.status === 'Pago') {
    payload.valor_recebido = consulta.valorRecebido || consulta.valorProcedimento;
    payload.data_recebimento = consulta.dataRecebimento || consulta.dataConsulta;
  }

  return payload;
};

const transformConsultaFromBackend = (consulta: any) => ({
  id: consulta.id,
  dataConsulta: consulta.data_consulta,
  protocolo: consulta.protocolo,
  consultorio: consulta.consultorio,
  tipoLocal: consulta.tipo_local || '',
  tipoPagamento: (consulta.tipo_pagamento === 'PARTICULAR' ? 'particular' : 'convenio') as 'particular' | 'convenio' | '',
  valorProcedimento: parseFloat(consulta.valor_bruto),
  descricaoProcedimento: consulta.descricao_procedimento,
  medicoId: consulta.medico_id,
  pacienteId: consulta.paciente_id,
  planoSaudeId: consulta.plano_saude_id,
  numeroCarteirinha: consulta.numero_carteirinha || '',
  status: (consulta.status_pagamento === 'PENDENTE' ? 'Pendente' : 
           consulta.status_pagamento === 'PAGO' ? 'Pago' : 
           consulta.status_pagamento === 'GLOSA' ? 'Glosado' : '') as 'Pendente' | 'Pago' | 'Glosado' | '',
  usuarioInclusao: consulta.usuario_inclusao?.email || '',
  dataInclusao: consulta.created_at,
  usuarioAlteracao: consulta.usuario_alteracao?.email || '',
  dataAlteracao: consulta.updated_at,
  especialidade: consulta.medico?.especialidade || '',
  valorRecebido: consulta.valor_recebido ? parseFloat(consulta.valor_recebido) : undefined,
  dataRecebimento: consulta.data_recebimento || undefined,
});

// --- API de Consultas ---
export const consultasAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI('/consultas');
      const data = response.data || response;
      return Array.isArray(data) ? data.map(transformConsultaFromBackend) : [];
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock para consultas');
      const { mockConsultas } = await import('../data/mockData');
      return mockConsultas;
    }
  },
  getById: async (id: number) => {
    const data = await fetchAPI(`/consultas/${id}`);
    return transformConsultaFromBackend(data);
  },
  create: (data: any) => 
    fetchAPI('/consultas', { 
      method: 'POST', 
      body: JSON.stringify(transformConsultaToBackend(data)) 
    }).then(transformConsultaFromBackend),
  update: (id: number, data: any) => 
    fetchAPI(`/consultas/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(transformConsultaToBackend(data)) 
    }).then(transformConsultaFromBackend),
  delete: (id: number) => fetchAPI(`/consultas/${id}`, { method: 'DELETE' }),
};

const transformPlanoToBackend = (plano: any) => {
  // Tipos já estão no formato correto: PARTICULAR ou CONVENIO
  return {
    nome_plano: plano.nome,
    codigo_operadora: plano.codigoOperadora || null,
    tipo_plano: plano.tipo || 'CONVENIO',
    prazo_pagamento_dias: plano.prazoPagamentoDias || 30,
    valor_consulta_padrao: plano.valorConsultaPadrao || 100,
    percentual_glosa_historica: plano.percentualGlosa || 5,
  };
};

const transformPlanoFromBackend = (plano: any) => {
  if (!plano || !plano.id) {
    console.warn('Plano inválido recebido do backend:', plano);
    return null;
  }

  // Tipos já estão no formato correto: PARTICULAR ou CONVENIO
  return {
    id: plano.id,
    nome: plano.nome_plano || 'Sem nome',
    tipo: (plano.tipo_plano || 'CONVENIO') as 'PARTICULAR' | 'CONVENIO',
    ativo: plano.ativo !== false,
    createdAt: plano.created_at || new Date().toISOString(),
    updatedAt: plano.updated_at || new Date().toISOString(),
    codigoOperadora: plano.codigo_operadora || null,
    prazoPagamentoDias: plano.prazo_pagamento_dias || 30,
    valorConsultaPadrao: parseFloat(plano.valor_consulta_padrao) || 100,
    percentualGlosa: parseFloat(plano.percentual_glosa_historica) || 5,
  };
};

// --- API de Planos de Saúde ---
export const planosAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI('/planos');
      const planos = response.data?.planos || response.planos || response.data || response;
      
      if (!Array.isArray(planos)) {
        console.warn('Resposta de planos não é um array:', planos);
        throw new Error('Formato inválido');
      }
      
      const transformed = planos
        .map(transformPlanoFromBackend)
        .filter((p): p is NonNullable<typeof p> => p !== null);
      console.log(`${transformed.length} planos carregados com sucesso`);
      return transformed;
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock para planos de saúde');
      const { mockPlanosSaude } = await import('../data/mockData');
      return mockPlanosSaude;
    }
  },
  getById: async (id: number) => {
    const response = await fetchAPI(`/planos/${id}`);
    return transformPlanoFromBackend(response.data?.plano || response);
  },
  create: (data: any) => 
    fetchAPI('/planos', { 
      method: 'POST', 
      body: JSON.stringify(transformPlanoToBackend(data)) 
    }).then(res => transformPlanoFromBackend(res.data?.plano || res)),
  update: (id: number, data: any) => 
    fetchAPI(`/planos/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(transformPlanoToBackend(data)) 
    }).then(res => transformPlanoFromBackend(res.data?.plano || res)),
  delete: (id: number) => fetchAPI(`/planos/${id}`, { method: 'DELETE' }),
};

const transformHonorarioFromBackend = (honorario: any) => ({
  id: honorario.id,
  medicoId: honorario.consulta?.medico_id || 0,
  consultaId: honorario.consulta_id,
  planoSaudeId: honorario.plano_saude_id,
  dataConsulta: honorario.consulta?.data_consulta || honorario.created_at,
  valor: parseFloat(honorario.valor_liquido || honorario.valor_consulta || 0),
  status: (honorario.status_pagamento === 'PENDENTE' ? 'PENDENTE' :
           honorario.status_pagamento === 'ENVIADO' ? 'ENVIADO' :
           honorario.status_pagamento === 'PAGO' ? 'PAGO' : 'GLOSADO') as 'PENDENTE' | 'ENVIADO' | 'PAGO' | 'GLOSADO',
  motivo: honorario.motivo_glosa,
  createdAt: honorario.created_at,
  updatedAt: honorario.updated_at,
});

// --- API de Honorários ---
export const honorariosAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI('/honorarios');
      // Backend retorna { success, data: { honorarios, pagination, ... } }
      const honorarios = response.data?.honorarios || response.honorarios || [];
      return Array.isArray(honorarios) ? honorarios.map(transformHonorarioFromBackend) : [];
    } catch (error) {
      console.warn('Backend não disponível, usando dados mock para honorários');
      const { mockHonorarios } = await import('../data/mockData');
      return mockHonorarios;
    }
  },
  getById: async (id: number) => {
    const data = await fetchAPI(`/honorarios/${id}`);
    return transformHonorarioFromBackend(data.data?.honorario || data);
  },
  getByMedico: (medicoId: number) => fetchAPI(`/honorarios/medico/${medicoId}`),
  getByPlano: (planoId: number) => fetchAPI(`/honorarios/plano/${planoId}`),
  create: (data: any) => fetchAPI('/honorarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/honorarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) => fetchAPI(`/honorarios/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status_pagamento: status }) 
  }),
  updateGlosa: (id: number, data: { valor_glosa: number; motivo_glosa: string }) => 
    fetchAPI(`/honorarios/${id}/glosa`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  delete: (id: number) => fetchAPI(`/honorarios/${id}`, { method: 'DELETE' }),
};

// --- API de Estatísticas ---
export const estatisticasAPI = {
  getDashboard: async () => {
    const response = await fetchAPI('/estatisticas/resumo');
    const data = response.data || response;
    
    // Transformar para o formato esperado pelo frontend
    if (data.financeiro) {
      return {
        totalProcessado: data.financeiro.valorTotal || 0,
        totalPendente: data.financeiro.valorPendente || 0,
        totalPago: data.financeiro.valorPago || 0,
        totalGlosado: data.financeiro.valorGlosado || 0,
        taxaGlosa: data.financeiro.taxaGlosa || 0,
        quantidadeHonorarios: data.contadores?.totalConsultas || 0,
      };
    }
    
    // Fallback para evitar erros
    return {
      totalProcessado: 0,
      totalPendente: 0,
      totalPago: 0,
      totalGlosado: 0,
      taxaGlosa: 0,
      quantidadeHonorarios: 0,
    };
  },
};

// --- API de Autenticação ---
export const authAPI = {
  login: async (email: string, senha: string) => {
    // Primeiro tentar autenticação mock diretamente
    console.log('🔐 Iniciando processo de login...');
    console.log('📧 Email:', email);
    
    try {
      // Importar usuários mock
      const { mockUsuarios } = await import('../data/mockData');
      console.log('📋 Usuários disponíveis:', mockUsuarios.length);
      
      // Procurar usuário
      const usuario = mockUsuarios.find(u => {
        console.log(`Verificando: ${u.email} === ${email}? ${u.email === email}`);
        console.log(`Senha correta? ${u.senha === senha}`);
        console.log(`Ativo? ${u.ativo}`);
        return u.email === email && u.senha === senha && u.ativo;
      });
      
      if (!usuario) {
        console.error('❌ Usuário não encontrado ou credenciais inválidas');
        throw new Error('Email ou senha inválidos');
      }
      
      console.log('✅ Usuário encontrado:', usuario.nome, '-', usuario.perfil);
      
      // Gerar token mock
      const mockToken = `mock_token_${usuario.id}_${Date.now()}`;
      tokenManager.setToken(mockToken);
      
      const response = {
        success: true,
        data: {
          token: mockToken,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            cargo: usuario.cargo,
          }
        }
      };
      
      console.log('📦 Resposta completa:', JSON.stringify(response, null, 2));
      return response;
      
    } catch (error: any) {
      console.error('💥 Erro na autenticação mock:', error);
      throw error;
    }
  },
  logout: () => {
    tokenManager.removeToken();
    try {
      return fetchAPI('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Se o backend não estiver disponível, apenas limpar o token
      return Promise.resolve({ success: true });
    }
  },
  me: () => fetchAPI('/auth/me'),
};
