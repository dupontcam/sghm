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
    const response = await fetchAPI('/medicos');
    const data = response.data || response;
    return Array.isArray(data) ? data.map(transformMedicoFromBackend) : [];
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
});

const transformPacienteFromBackend = (paciente: any) => ({
  id: paciente.id,
  nome: paciente.nome_paciente,
  dataNascimento: paciente.data_nascimento,
  cpf: paciente.cpf,
  email: paciente.email,
  telefone: paciente.telefone,
  convenio: paciente.convenio || '',
  carteirinha: paciente.carteirinha || '',
});

// --- API de Pacientes ---
export const pacientesAPI = {
  getAll: async () => {
    const response = await fetchAPI('/pacientes');
    const data = response.data || response;
    return Array.isArray(data) ? data.map(transformPacienteFromBackend) : [];
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

// --- API de Consultas ---
export const consultasAPI = {
  getAll: async () => {
    const response = await fetchAPI('/consultas');
    return response.data || response;
  },
  getById: (id: number) => fetchAPI(`/consultas/${id}`),
  create: (data: any) => fetchAPI('/consultas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/consultas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/consultas/${id}`, { method: 'DELETE' }),
};

// --- API de Planos de Saúde ---
export const planosAPI = {
  getAll: async () => {
    const response = await fetchAPI('/planos');
    return response.data?.planos || response.planos || response.data || response;
  },
  getById: (id: number) => fetchAPI(`/planos/${id}`),
  create: (data: any) => fetchAPI('/planos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/planos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/planos/${id}`, { method: 'DELETE' }),
};

// --- API de Honorários ---
export const honorariosAPI = {
  getAll: async () => {
    const response = await fetchAPI('/honorarios');
    // Backend retorna { success, data: { honorarios, pagination, ... } }
    return response.data?.honorarios || response.honorarios || [];
  },
  getById: (id: number) => fetchAPI(`/honorarios/${id}`),
  getByMedico: (medicoId: number) => fetchAPI(`/honorarios/medico/${medicoId}`),
  getByPlano: (planoId: number) => fetchAPI(`/honorarios/plano/${planoId}`),
  create: (data: any) => fetchAPI('/honorarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/honorarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) => fetchAPI(`/honorarios/${id}/status`, { 
    method: 'PATCH', 
    body: JSON.stringify({ status }) 
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
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (response.data?.token) {
      tokenManager.setToken(response.data.token);
    }
    return response;
  },
  logout: () => {
    tokenManager.removeToken();
    return fetchAPI('/auth/logout', { method: 'POST' });
  },
  me: () => fetchAPI('/auth/me'),
};
