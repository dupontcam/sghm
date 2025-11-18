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
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
};

// --- API de Médicos ---
export const medicosAPI = {
  getAll: () => fetchAPI('/medicos'),
  getById: (id: number) => fetchAPI(`/medicos/${id}`),
  create: (data: any) => fetchAPI('/medicos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/medicos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/medicos/${id}`, { method: 'DELETE' }),
};

// --- API de Pacientes ---
export const pacientesAPI = {
  getAll: () => fetchAPI('/pacientes'),
  getById: (id: number) => fetchAPI(`/pacientes/${id}`),
  create: (data: any) => fetchAPI('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/pacientes/${id}`, { method: 'DELETE' }),
};

// --- API de Consultas ---
export const consultasAPI = {
  getAll: () => fetchAPI('/consultas'),
  getById: (id: number) => fetchAPI(`/consultas/${id}`),
  create: (data: any) => fetchAPI('/consultas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/consultas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/consultas/${id}`, { method: 'DELETE' }),
};

// --- API de Planos de Saúde ---
export const planosAPI = {
  getAll: () => fetchAPI('/planos'),
  getById: (id: number) => fetchAPI(`/planos/${id}`),
  create: (data: any) => fetchAPI('/planos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/planos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/planos/${id}`, { method: 'DELETE' }),
};

// --- API de Honorários ---
export const honorariosAPI = {
  getAll: () => fetchAPI('/honorarios'),
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
  getDashboard: () => fetchAPI('/estatisticas/dashboard'),
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
