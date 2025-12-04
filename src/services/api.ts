import { usuariosService } from './usuariosService';

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

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 fetchAPI chamado');
  console.log('📍 Endpoint:', endpoint);
  console.log('📍 URL completa:', `${API_URL}${endpoint}`);
  console.log('🔑 Token no localStorage:', token ? '✅ SIM' : '❌ NÃO');

  if (token) {
    console.log('🔑 Token (primeiros 30 chars):', token.substring(0, 30) + '...');
    console.log('🔑 Token (últimos 10 chars):', '...' + token.substring(token.length - 10));
    console.log('🔑 Tamanho do token:', token.length, 'caracteres');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  console.log('📤 Headers que serão enviados:', headers);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    const errorMessage = error.error || error.message || `Erro ${response.status}`;
    console.error('❌ Erro na API:', { endpoint, status: response.status, error });
    
    // Log detalhado se houver erros de validação
    if (error.details) {
      console.error('📋 Detalhes da validação:', JSON.stringify(error.details, null, 2));
      error.details.forEach((detail: any, index: number) => {
        console.error(`   ${index + 1}. Campo: ${detail.campo} - Erro: ${detail.mensagem}`);
      });
    }
    
    throw new Error(errorMessage);
  }

  console.log('✅ Requisição bem-sucedida:', endpoint);

  // DELETE geralmente retorna 204 No Content sem body
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { success: true };
  }

  return response.json();
};

// --- Transformadores de dados ---
const transformMedicoToBackend = (medico: any) => {
  // Remover formatação de CPF e CRM (manter apenas números)
  const cpfLimpo = medico.cpf ? medico.cpf.replace(/\D/g, '') : '';
  const crmLimpo = medico.crm ? medico.crm.replace(/\D/g, '') : '';
  
  return {
    nome_medico: medico.nome,
    especialidade: medico.especialidade,
    crm: crmLimpo,
    cnpj_cpf: cpfLimpo,
    email: medico.email,
    telefone: medico.telefone,
    percentual_repasse: medico.percentual_repasse
  };
};

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

const transformPacienteToBackend = (paciente: any) => {
  // Remover formatação de CPF (manter apenas números)
  const cpfLimpo = paciente.cpf ? paciente.cpf.replace(/\D/g, '') : '';
  
  return {
    nome_paciente: paciente.nome,
    data_nascimento: paciente.dataNascimento || null,
    cpf: cpfLimpo,
    email: paciente.email,
    telefone: paciente.telefone,
    convenio: paciente.convenio || null,
    numero_carteirinha: paciente.carteirinha || null,
  };
};

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
    const response = await fetchAPI('/pacientes');
    const data = response.data || response;
    return Array.isArray(data) ? data.map(transformPacienteFromBackend) : [];
  },
  getById: async (id: number) => {
    const data = await fetchAPI(`/pacientes/${id}`);
    return transformPacienteFromBackend(data);
  },
  create: (data: any) => {
    const transformed = transformPacienteToBackend(data);
    console.log('📤 Paciente original:', data);
    console.log('📤 Paciente transformado para backend:', transformed);
    return fetchAPI('/pacientes', {
      method: 'POST',
      body: JSON.stringify(transformed)
    }).then(transformPacienteFromBackend);
  },
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
    const response = await fetchAPI('/consultas');
    const data = response.data || response;
    return Array.isArray(data) ? data.map(transformConsultaFromBackend) : [];
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

const transformHonorarioToBackend = (honorario: any) => {
  // Mapear status do frontend para o backend
  // Backend aceita: PENDENTE, ENVIADO, PAGO, GLOSADO
  const statusMap: Record<string, string> = {
    'PENDENTE': 'PENDENTE',
    'ENVIADO': 'ENVIADO',
    'PAGO': 'PAGO',
    'GLOSADO': 'GLOSADO'  // Corrigido: backend espera GLOSADO, não GLOSA
  };

  return {
    consulta_id: honorario.consultaId,
    plano_saude_id: honorario.planoSaudeId,
    valor_liquido: honorario.valor,
    status_pagamento: statusMap[honorario.status] || 'PENDENTE',
    motivo_glosa: honorario.motivoGlosa || honorario.motivo || null,
    recurso_enviado: honorario.recursoEnviado || false,
    status_recurso: honorario.statusRecurso || null,
    data_recurso: honorario.dataRecurso || null,
    motivo_recurso: honorario.motivoRecurso || null,
    valor_recuperado: honorario.valorRecuperado || null,
  };
};

const transformHonorarioFromBackend = (honorario: any) => ({
  id: honorario.id,
  medicoId: honorario.consulta?.medico_id || 0,
  consultaId: honorario.consulta_id,
  planoSaudeId: honorario.plano_saude_id,
  dataConsulta: honorario.consulta?.data_consulta || honorario.created_at,
  valor: parseFloat(honorario.valor_liquido || honorario.valor_consulta || 0),
  valorGlosa: honorario.valor_glosa !== undefined ? parseFloat(honorario.valor_glosa) : undefined,
  status: (honorario.status_pagamento === 'PENDENTE' ? 'PENDENTE' :
    honorario.status_pagamento === 'ENVIADO' ? 'ENVIADO' :
      honorario.status_pagamento === 'PAGO' ? 'PAGO' : 'GLOSADO') as 'PENDENTE' | 'ENVIADO' | 'PAGO' | 'GLOSADO',
  motivoGlosa: honorario.motivo_glosa || null,  // Corrigido: usar motivoGlosa (camelCase)
  recursoEnviado: honorario.recurso_enviado || false,
  statusRecurso: honorario.status_recurso || null,
  dataRecurso: honorario.data_recurso || null,
  motivoRecurso: honorario.motivo_recurso || null,
  valorRecuperado: honorario.valor_recuperado ? parseFloat(honorario.valor_recuperado) : null,
  createdAt: honorario.created_at,
  updatedAt: honorario.updated_at,
});

// --- API de Honorários ---
export const honorariosAPI = {
  getAll: async () => {
    const response = await fetchAPI('/honorarios');
    // Backend retorna { success, data: { honorarios, pagination, ... } }
    const honorarios = response.data?.honorarios || response.honorarios || [];
    return Array.isArray(honorarios) ? honorarios.map(transformHonorarioFromBackend) : [];
  },
  getById: async (id: number) => {
    const data = await fetchAPI(`/honorarios/${id}`);
    return transformHonorarioFromBackend(data.data?.honorario || data);
  },
  getByMedico: (medicoId: number) => fetchAPI(`/honorarios/medico/${medicoId}`),
  getByPlano: (planoId: number) => fetchAPI(`/honorarios/plano/${planoId}`),
  create: (data: any) => fetchAPI('/honorarios', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: number, data: any) => {
    // Tenta PATCH primeiro, se falhar tenta PUT, se falhar usa updateStatus
    const payload = transformHonorarioToBackend(data);
    console.log('📤 Payload sendo enviado para backend:', payload);

    try {
      return await fetchAPI(`/honorarios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
    } catch (patchError: any) {
      console.warn('⚠️ PATCH falhou (404), tentando PUT...', patchError.message);
      try {
        return await fetchAPI(`/honorarios/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } catch (putError: any) {
        console.warn('⚠️ PUT falhou, tentando updateStatus...', putError.message);
        // Como último recurso, atualiza apenas o status
        if (data.status) {
          console.log('🔄 Usando updateStatus como fallback');
          return await fetchAPI(`/honorarios/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status_pagamento: payload.status_pagamento })
          });
        }
        throw putError;
      }
    }
  },
  updateStatus: (id: number, status: string) => fetchAPI(`/honorarios/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status_pagamento: status })
  }),
  updateGlosa: (id: number, data: { valor_glosa: number; motivo_glosa: string }) =>
    fetchAPI(`/honorarios/${id}/glosa`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  enviarRecurso: (id: number, data: { motivo_recurso: string; data_recurso?: string }) =>
    fetchAPI(`/honorarios/${id}/recurso`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  atualizarStatusRecurso: (id: number, data: { status_recurso: string; valor_recuperado?: number }) =>
    fetchAPI(`/honorarios/${id}/recurso/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  getHistorico: async (id: number) => {
    const response = await fetchAPI(`/honorarios/${id}/historico`);
    return response.data || response;
  },
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
    console.log('🔐 Iniciando processo de login...');
    console.log('📧 Email:', email);

    try {
      // Fazer chamada ao backend real
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        console.error('❌ Erro no login:', errorData);
        throw new Error(errorData.error || errorData.message || 'Email ou senha inválidos');
      }

      const data = await response.json();
      console.log('✅ Login bem-sucedido no backend!');
      console.log('📦 Resposta do backend:', data);

      // Salvar token no localStorage
      if (data.data?.token) {
        tokenManager.setToken(data.data.token);
        console.log('🔑 Token salvo:', data.data.token.substring(0, 30) + '...');
      }

      return data;

    } catch (error: any) {
      console.error('💥 Erro na autenticação:', error);

      // Fallback para mock apenas se backend não estiver disponível
      if (error.message.includes('fetch')) {
        console.warn('⚠️ Backend não disponível, usando fallback mock');
        const usuario = usuariosService.validatePassword(email, senha);

        if (!usuario) {
          throw new Error('Email ou senha inválidos');
        }

        const mockToken = `mock_token_${usuario.id}_${Date.now()}`;
        tokenManager.setToken(mockToken);

        return {
          success: true,
          data: {
            token: mockToken,
            usuario: {
              id: usuario.id,
              nome: usuario.nome,
              email: usuario.email,
              perfil: usuario.perfil,
              cargo: usuario.cargo,
              telefone: usuario.telefone,
            }
          }
        };
      }

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
  changePassword: (senha_atual: string, nova_senha: string) =>
    fetchAPI('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ senha_atual, nova_senha })
    }),
};

const transformUsuarioToBackend = (usuario: any) => ({
  nome_completo: usuario.nome,
  email: usuario.email,
  senha: usuario.senha,
  role: usuario.perfil === 'Admin' ? 'ADMIN' : 'OPERADOR',
  telefone: usuario.telefone || null,
  // cargo e ativo não existem no backend ainda, ignorando por enquanto
});

const transformUsuarioFromBackend = (usuario: any) => ({
  id: usuario.id,
  nome: usuario.nome_completo,
  email: usuario.email,
  senha: '', // Senha não retorna do backend
  perfil: (usuario.role === 'ADMIN' ? 'Admin' : 'Operador') as 'Admin' | 'Operador',
  cargo: usuario.role === 'ADMIN' ? 'Administrador' : 'Operador', // Valor default
  telefone: usuario.telefone || '',
  ativo: true, // Valor default
});

// --- API de Usuários ---
export const usuariosAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI('/auth/users');
      const data = response.data || response;
      return Array.isArray(data) ? data.map(transformUsuarioFromBackend) : [];
    } catch (error) {
      console.warn('Backend não disponível ou erro ao listar usuários', error);
      throw error;
    }
  },
  create: (data: any) =>
    fetchAPI('/auth/create-user', {
      method: 'POST',
      body: JSON.stringify(transformUsuarioToBackend(data))
    }).then(res => transformUsuarioFromBackend(res.user || res.data?.user)),
  update: (id: number, data: any) =>
    fetchAPI(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformUsuarioToBackend(data))
    }).then(res => transformUsuarioFromBackend(res.user || res.data?.user)),
  // Delete não implementado no backend ainda
  delete: (id: number) => Promise.reject(new Error('Exclusão não suportada pelo backend')),
};
