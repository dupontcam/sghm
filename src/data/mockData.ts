// --- DEFINIÇÕES DE TIPO (INTERFACES) ---

export interface Medico {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  crm: string;
  especialidade: string;
  cpf: string; // Campo novo
}

export interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  convenio: string; // Campo novo
  carteirinha: string; // Campo novo
}

export interface Consulta {
  id: number;
  usuarioInclusao: string;
  dataInclusao: string;
  usuarioAlteracao: string;
  dataAlteracao: string;
  status: 'Pendente' | 'Pago' | 'Glosado' | '';
  // Dados do Formulário
  pacienteId: number;
  protocolo: string;
  consultorio: string;
  tipoLocal?: string;
  tipoPagamento: 'particular' | 'convenio' | '';
  medicoId: number;
  dataConsulta: string;
  especialidade: string;
  valorProcedimento: number;
  descricaoProcedimento: string;
  // Campos de pagamento
  valorRecebido?: number;
  dataRecebimento?: string;
  // Campos de plano de saúde
  planoSaudeId?: number | null;
  numeroCarteirinha?: string;
}

export interface PlanoSaude {
  id: number;
  nome: string;
  tipo: 'PARTICULAR' | 'CONVENIO';
  ativo: boolean;
  codigoOperadora?: string | null;
  valorConsultaPadrao?: number;
  prazoPagamentoDias?: number;
  percentualGlosa?: number;
  createdAt: string;
  updatedAt: string;
  totalHonorarios?: number;
  totalConsultas?: number;
}

export interface Honorario {
  id: number;
  medicoId: number;
  consultaId: number;
  planoSaudeId: number;
  dataConsulta: string;
  valor: number;
  valorGlosa?: number; // Valor glosado (parcial ou total)
  status: 'PENDENTE' | 'ENVIADO' | 'PAGO' | 'GLOSADO';
  motivoGlosa?: string; // Motivo da glosa (quando status = GLOSADO)
  numeroGuia?: string; // Número da guia/protocolo
  observacoes?: string; // Observações gerais
  createdAt: string;
  updatedAt: string;
  // Dados relacionados para exibição
  medico?: Medico;
  planoSaude?: PlanoSaude;
  consulta?: Consulta;
}

export interface DashboardStats {
  totalProcessado: number;
  totalPendente: number;
  totalPago: number;
  totalGlosado: number;
  taxaGlosa: number;
  quantidadeHonorarios: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: 'Admin' | 'Operador';
  cargo: string;
  ativo: boolean;
}

// --- DADOS DE EXEMPLO (MOCK DATA) ---

// Usuários de teste para autenticação
export const mockUsuarios: Usuario[] = [
  { 
    id: 1, 
    nome: 'Administrador do Sistema', 
    email: 'admin@sghm.com', 
    senha: 'admin123', 
    perfil: 'Admin', 
    cargo: 'Administrador',
    ativo: true 
  },
  { 
    id: 2, 
    nome: 'Operador Padrão', 
    email: 'operador@sghm.com', 
    senha: 'operador123', 
    perfil: 'Operador', 
    cargo: 'Operador de Sistema',
    ativo: true 
  },
  { 
    id: 3, 
    nome: 'João Silva', 
    email: 'joao@sghm.com', 
    senha: '123456', 
    perfil: 'Operador', 
    cargo: 'Operador',
    ativo: true 
  }
];

export const mockMedicos: Medico[] = [
  { id: 1, nome: 'Dr. Carlos Alberto', email: 'carlos@med.com', telefone: '(61) 9999-1111', crm: '12345-DF', especialidade: 'Cardiologia', cpf: '111.222.333-44' },
  { id: 2, nome: 'Dra. Karyne Sousa', email: 'karyne@med.com', telefone: '(61) 9999-2222', crm: '54321-DF', especialidade: 'Dermatologia', cpf: '222.333.444-55' },
  { id: 3, nome: 'Dr. João Silva', email: 'joao@med.com', telefone: '(61) 9999-3333', crm: '67890-DF', 
    especialidade: 'Pediatria', cpf: '333.444.555-66' },
  { id: 4, nome: 'Dra. Maria Fernanda', email: 'maria@med.com', telefone: '(61) 9999-4444', crm: '98765-DF', especialidade: 'Ginecologia', cpf: '444.555.666-77' },
  { id: 5, nome: 'Dr. Pedro Henrique', email: 'pedro@med.com', telefone: '(61) 9999-5555', crm: '13579-DF', especialidade: 'Ortopedia', cpf: '555.666.777-88' },
  { id: 6, nome: 'Dra. Ana Paula', email: 'ana@med.com', telefone: '(61) 9999-6666', crm: '24680-DF', especialidade: 'Oftalmologia', cpf: '666.777.888-99' }
];

export const mockPacientes: Paciente[] = [
  { id: 1, nome: 'Daniel Torres', email: 'daniel@paciente.com', telefone: '(61) 9888-1111', cpf: '333.444.555-66', convenio: 'Bradesco Saúde', carteirinha: '123456789' },
  { id: 2, nome: 'Dionismar Rodrigues', email: 'dionismar@paciente.com', telefone: '(61) 9888-2222', cpf: '444.555.666-77', convenio: 'Amil', carteirinha: '987654321' },
  { id: 3, nome: 'Lucas Raziel', email: 'lucas@paciente.com', telefone: '(61) 9888-3333', cpf: '555.666.777-88', convenio: 'SulAmérica', carteirinha: '000111222' },
  { id: 4, nome: 'Mariana Lima', email: 'mariana@paciente.com', telefone: '(61) 9888-4444', cpf: '666.777.888-99', convenio: 'Bradesco Saúde', carteirinha: '123123123' },
  { id: 5, nome: 'Fernanda Costa', email: 'fernanda@paciente.com', telefone: '(61) 9888-5555', cpf: '777.888.999-00', convenio: 'Amil', carteirinha: '321321321' },
  { id: 6, nome: 'Rafael Souza', email: 'rafael@paciente.com', telefone: '(61) 9888-6666', cpf: '888.999.000-11', convenio: 'SulAmérica', carteirinha: '456456456' },
  { id: 7, nome: 'Aline Pereira', email: 'aline@paciente.com', telefone: '(61) 9888-7777', cpf: '999.000.111-22', convenio: 'Bradesco Saúde', carteirinha: '789789789' },
  { id: 8, nome: 'Bruno Fernandes', email: 'bruno@paciente.com', telefone: '(61) 9888-8888', cpf: '000.111.222-33', convenio: 'Amil', carteirinha: '321321321' },
  { id: 9, nome: 'Camila Rocha', email: 'camila@paciente.com', telefone: '(61) 9888-9999', cpf: '111.222.333-44', convenio: 'SulAmérica', carteirinha: '654654654' }
];

export const mockConsultas: Consulta[] = [
  { 
    id: 1, pacienteId: 1, medicoId: 1, dataConsulta: '2025-10-01', 
    protocolo: 'PROTO-001', consultorio: 'Asa Sul', tipoPagamento: 'convenio', 
    especialidade: 'Cardiologia', valorProcedimento: 350.00, 
    descricaoProcedimento: 'Consulta de rotina', status: 'Pendente', 
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-02T10:00:00Z', 
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-02T10:00:00Z' 
  },
  { 
    id: 2, pacienteId: 2, medicoId: 2, dataConsulta: '2025-10-03', 
    protocolo: 'PROTO-002', consultorio: 'Asa Norte', tipoPagamento: 'particular', 
    especialidade: 'Dermatologia', valorProcedimento: 450.00, 
    descricaoProcedimento: 'Procedimento estético', status: 'Pago', 
    valorRecebido: 450.00, dataRecebimento: '2025-10-10',
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-03T11:00:00Z', 
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-03T11:00:00Z' 
  },
  { 
    id: 3, pacienteId: 3, medicoId: 1, dataConsulta: '2025-10-04', 
    protocolo: 'PROTO-003', consultorio: 'Asa Sul', tipoPagamento: 'convenio', 
    especialidade: 'Cardiologia', valorProcedimento: 350.00, 
    descricaoProcedimento: 'Exame (ECG)', status: 'Glosado', 
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-04T14:00:00Z', 
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-04T14:00:00Z' 
  },
  {
    id: 4, pacienteId: 4, medicoId: 3, dataConsulta: '2025-10-05',
    protocolo: 'PROTO-004', consultorio: 'Asa Sul', tipoPagamento: 'particular',
    especialidade: 'Pediatria', valorProcedimento: 400.00,
    descricaoProcedimento: 'Consulta de rotina', status: 'Pendente',
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-05T10:00:00Z',
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-05T10:00:00Z'
  },
  {
    id: 5, pacienteId: 5, medicoId: 4, dataConsulta: '2025-10-06',
    protocolo: 'PROTO-005', consultorio: 'Asa Norte', tipoPagamento: 'convenio',
    especialidade: 'Ginecologia', valorProcedimento: 500.00,
    descricaoProcedimento: 'Exame preventivo', status: 'Pago',
    valorRecebido: 500.00, dataRecebimento: '2025-11-20',
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-06T09:00:00Z',
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-06T09:00:00Z'
  },
  {
    id: 6, pacienteId: 6, medicoId: 5, dataConsulta: '2025-10-07',
    protocolo: 'PROTO-006', consultorio: 'Asa Sul', tipoPagamento: 'particular',
    especialidade: 'Ortopedia', valorProcedimento: 600.00,
    descricaoProcedimento: 'Consulta inicial', status: 'Glosado',
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-07T08:00:00Z',
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-07T08:00:00Z'
  },
  {
    id: 7, pacienteId: 7, medicoId: 6, dataConsulta: '2025-10-08',
    protocolo: 'PROTO-007', consultorio: 'Asa Norte', tipoPagamento: 'convenio',
    especialidade: 'Oftalmologia', valorProcedimento: 700.00,
    descricaoProcedimento: 'Exame de vista', status: 'Pendente',
    usuarioInclusao: 'operador@sghm.com', dataInclusao: '2025-10-08T09:00:00Z',
    usuarioAlteracao: 'operador@sghm.com', dataAlteracao: '2025-10-08T09:00:00Z'
  }
];

// --- PLANOS DE SAÚDE (MOCK DATA) ---
export const mockPlanosSaude: PlanoSaude[] = [
  { id: 1, nome: 'Unimed DF', tipo: 'CONVENIO', ativo: true, codigoOperadora: '324523', valorConsultaPadrao: 350, prazoPagamentoDias: 30, percentualGlosa: 3.5, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-10-01T00:00:00Z' },
  { id: 2, nome: 'Bradesco Saúde', tipo: 'CONVENIO', ativo: true, codigoOperadora: '237001', valorConsultaPadrao: 320, prazoPagamentoDias: 45, percentualGlosa: 4.2, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-10-01T00:00:00Z' },
  { id: 3, nome: 'Amil', tipo: 'CONVENIO', ativo: true, codigoOperadora: '326305', valorConsultaPadrao: 380, prazoPagamentoDias: 30, percentualGlosa: 2.8, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-10-01T00:00:00Z' },
  { id: 4, nome: 'SulAmérica Saúde', tipo: 'CONVENIO', ativo: true, codigoOperadora: '329465', valorConsultaPadrao: 360, prazoPagamentoDias: 35, percentualGlosa: 3.1, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-10-01T00:00:00Z' },
  { id: 5, nome: 'Particular', tipo: 'PARTICULAR', ativo: true, codigoOperadora: null, valorConsultaPadrao: 400, prazoPagamentoDias: 0, percentualGlosa: 0, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-10-01T00:00:00Z' }
];

// --- HONORÁRIOS (MOCK DATA) ---
export const mockHonorarios: Honorario[] = [
  { 
    id: 1, medicoId: 1, consultaId: 1, planoSaudeId: 2, dataConsulta: '2025-10-01', 
    valor: 350.00, status: 'PENDENTE', createdAt: '2025-10-02T10:00:00Z', updatedAt: '2025-10-02T10:00:00Z' 
  },
  { 
    id: 2, medicoId: 2, consultaId: 2, planoSaudeId: 6, dataConsulta: '2025-10-03', 
    valor: 450.00, status: 'PAGO', createdAt: '2025-10-03T11:00:00Z', updatedAt: '2025-10-03T11:00:00Z' 
  },
  { 
    id: 3, medicoId: 1, consultaId: 3, planoSaudeId: 5, dataConsulta: '2025-10-04', 
    valor: 350.00, status: 'GLOSADO', motivoGlosa: 'Documentação incompleta', createdAt: '2025-10-04T14:00:00Z', updatedAt: '2025-10-04T14:00:00Z' 
  },
  { 
    id: 4, medicoId: 3, consultaId: 4, planoSaudeId: 6, dataConsulta: '2025-10-05', 
    valor: 400.00, status: 'ENVIADO', createdAt: '2025-10-05T10:00:00Z', updatedAt: '2025-10-05T10:00:00Z' 
  }
];

// --- FUNÇÕES AUXILIARES ---

/**
 * Calcula o tempo médio de pagamento em dias
 * Considera apenas consultas com status 'Pago' que possuem dataConsulta e dataRecebimento
 * @param consultas Array de consultas para análise
 * @returns Tempo médio em dias ou 0 se não houver consultas pagas
 */
export const calcularTempoMedioPagamento = (consultas: Consulta[]): number => {
  const consultasPagas = consultas.filter(c => 
    c.status === 'Pago' && 
    c.dataConsulta && 
    c.dataRecebimento
  );

  if (consultasPagas.length === 0) {
    return 0;
  }

  const totalDias = consultasPagas.reduce((acc, consulta) => {
    const dataConsulta = new Date(consulta.dataConsulta);
    const dataRecebimento = new Date(consulta.dataRecebimento!);
    const diferencaDias = Math.floor((dataRecebimento.getTime() - dataConsulta.getTime()) / (1000 * 60 * 60 * 24));
    return acc + diferencaDias;
  }, 0);

  return Math.round(totalDias / consultasPagas.length);
};