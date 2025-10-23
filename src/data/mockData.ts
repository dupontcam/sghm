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
  tipoPagamento: 'particular' | 'convenio' | '';
  medicoId: number;
  dataConsulta: string;
  especialidade: string;
  valorProcedimento: number;
  descricaoProcedimento: string;
}

// --- DADOS DE EXEMPLO (MOCK DATA) ---

export const mockMedicos: Medico[] = [
  { id: 1, nome: 'Dr. Carlos Alberto', email: 'carlos@med.com', telefone: '(61) 9999-1111', crm: '12345-DF', especialidade: 'Cardiologia', cpf: '111.222.333-44' },
  { id: 2, nome: 'Dra. Karyne Sousa', email: 'karyne@med.com', telefone: '(61) 9999-2222', crm: '54321-DF', especialidade: 'Dermatologia', cpf: '222.333.444-55' },
];

export const mockPacientes: Paciente[] = [
  { id: 1, nome: 'Daniel Torres', email: 'daniel@paciente.com', telefone: '(61) 9888-1111', cpf: '333.444.555-66', convenio: 'Bradesco Saúde', carteirinha: '123456789' },
  { id: 2, nome: 'Dionismar Rodrigues', email: 'dionismar@paciente.com', telefone: '(61) 9888-2222', cpf: '444.555.666-77', convenio: 'Amil', carteirinha: '987654321' },
  { id: 3, nome: 'Lucas Raziel', email: 'lucas@paciente.com', telefone: '(61) 9888-3333', cpf: '555.666.777-88', convenio: 'SulAmérica', carteirinha: '000111222' },
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
];