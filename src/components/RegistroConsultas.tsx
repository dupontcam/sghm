import React, { useState, useEffect } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';
import Modal from './Modal';
import './Formulario.css';
import './RegistroConsultas.css';

// --- Tipos de Dados ---
interface Consulta {
  // Campos de Log (Sistêmicos)
  id: number;
  usuarioInclusao: string;
  dataInclusao: string;
  usuarioAlteracao: string;
  dataAlteracao: string;
  
  // Campos do Formulário
  pacienteId: number; // Usaremos ID para o <select>
  protocolo: string;
  consultorio: string;
  tipoPagamento: 'particular' | 'convenio' | '';
  medicoId: number; // Usaremos ID para o <select>
  dataConsulta: string; // Formato YYYY-MM-DD
  especialidade: string;
  valorProcedimento: number;
  descricaoProcedimento: string;
  
  // Campo de Status (do nosso fluxo)
  status: 'Pendente' | 'Pago' | 'Glosado' | '';
}

// Para os dropdowns
interface Medico {
  id: number;
  nome: string;
}
interface Paciente {
  id: number;
  nome: string;
}

// --- Dados de Exemplo (Mock Data) ---
const mockConsultas: Consulta[] = [
  {
    id: 1001,
    usuarioInclusao: 'admin', dataInclusao: '2025-10-20T10:00:00Z', usuarioAlteracao: 'admin', dataAlteracao: '2025-10-20T10:00:00Z',
    pacienteId: 1, protocolo: 'PRT-001', consultorio: 'Asa Sul', tipoPagamento: 'convenio', medicoId: 1,
    dataConsulta: '2025-10-15', especialidade: 'Cardiologia', valorProcedimento: 350.00,
    descricaoProcedimento: 'Consulta de rotina', status: 'Pendente'
  },
  {
    id: 1002,
    usuarioInclusao: 'admin', dataInclusao: '2025-10-21T11:00:00Z', usuarioAlteracao: 'admin', dataAlteracao: '2025-10-21T11:00:00Z',
    pacienteId: 2, protocolo: 'PRT-002', consultorio: 'Asa Norte', tipoPagamento: 'particular', medicoId: 2,
    dataConsulta: '2025-10-16', especialidade: 'Neurologia', valorProcedimento: 500.00,
    descricaoProcedimento: 'Consulta de acompanhamento', status: 'Pago'
  },
  {
    id: 1003,
    usuarioInclusao: 'admin', dataInclusao: '2025-10-22T14:00:00Z', usuarioAlteracao: 'admin', dataAlteracao: '2025-10-22T14:00:00Z',
    pacienteId: 1, protocolo: 'PRT-003', consultorio: 'Asa Sul', tipoPagamento: 'convenio', medicoId: 1,
    dataConsulta: '2025-10-18', especialidade: 'Cardiologia', valorProcedimento: 150.00,
    descricaoProcedimento: 'Exame ECG', status: 'Glosado'
  },
];

// (Simulação) Isso viria do backend ou de outro state
const mockMedicos: Medico[] = [
  { id: 1, nome: 'Dr. Carlos Alberto' },
  { id: 2, nome: 'Dra. Karyne Sousa' },
];

const mockPacientes: Paciente[] = [
  { id: 1, nome: 'Daniel Torres' },
  { id: 2, nome: 'Dionismar Rodrigues' },
];

const estadoInicialFormulario: Consulta = {
  id: 0,
  usuarioInclusao: '', dataInclusao: '', usuarioAlteracao: '', dataAlteracao: '',
  pacienteId: 0,
  protocolo: '',
  consultorio: '',
  tipoPagamento: '',
  medicoId: 0,
  dataConsulta: '',
  especialidade: '',
  valorProcedimento: 0,
  descricaoProcedimento: '',
  status: 'Pendente',
};

const RegistroConsultas: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultas, setConsultas] = useState(mockConsultas);
  const [consultaParaEditar, setConsultaParaEditar] = useState<Consulta | null>(null);
  const [formData, setFormData] = useState<Consulta>(estadoInicialFormulario);
  const [isEditing, setIsEditing] = useState(false);

  // Listas para os dropdowns (normalmente viriam de uma API)
  const [medicos] = useState<Medico[]>(mockMedicos);
  const [pacientes] = useState<Paciente[]>(mockPacientes);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Processar o valor com base no nome do campo
    let valorProcessado: any = value;

    if (name === 'valorProcedimento') {
      valorProcessado = parseFloat(value) || 0; // Garante que é um número
    } else if (name === 'pacienteId' || name === 'medicoId') {
      valorProcessado = parseInt(value, 10);
    }
    
    // O setFormData aqui "contamina" o tipo do formData (status vira string),
    // mas vamos corrigir isso no handleSubmit.
    setFormData(prevState => ({
      ...prevState,
      [name]: valorProcessado
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agora = new Date().toISOString();

    if (isEditing && consultaParaEditar) {
      // Lógica de Edição
      
      // ================== INÍCIO DA CORREÇÃO ==================
      // Recriamos o objeto, forçando os tipos corretos
      const consultaAtualizada: Consulta = { 
        ...formData, 
        // Força o 'status' a ser do tipo correto, em vez de 'string'
        status: formData.status as Consulta['status'], 
        // Força o 'tipoPagamento' a ser do tipo correto
        tipoPagamento: formData.tipoPagamento as Consulta['tipoPagamento'],
        usuarioAlteracao: 'operador_edit', // Simulação
        dataAlteracao: agora 
      };
      // =================== FIM DA CORREÇÃO ===================
      
      setConsultas(consultas.map(consulta =>
        consulta.id === consultaParaEditar.id ? consultaAtualizada : consulta
      ));
      console.log('Consulta atualizada:', consultaAtualizada);

    } else {
      // Lógica de Criação

      // ================== INÍCIO DA CORREÇÃO ==================
      // Recriamos o objeto, forçando os tipos corretos
      const novaConsulta: Consulta = {
        ...formData,
        // Força os tipos corretos aqui também
        status: 'Pendente', // Status padrão na criação
        tipoPagamento: formData.tipoPagamento as Consulta['tipoPagamento'],
        
        id: Math.floor(Math.random() * 10000), // Novo ID aleatório
        usuarioInclusao: 'operador_new', // Simulação
        dataInclusao: agora,
        usuarioAlteracao: 'operador_new',
        dataAlteracao: agora,
      };
      // =================== FIM DA CORREÇÃO ===================

      // Esta linha (agora ~158) funciona, pois 'novaConsulta' tem o tipo Consulta
      setConsultas([...consultas, novaConsulta]);
      console.log('Nova consulta salva:', novaConsulta);
    }
    closeModal();
  };

  const handleNew = () => {
    // Para dataConsulta, pegamos o dia de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split('T')[0];
    setFormData({ ...estadoInicialFormulario, dataConsulta: hoje });
    setConsultaParaEditar(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (consulta: Consulta) => {
    setFormData(consulta);
    setConsultaParaEditar(consulta);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setConsultaParaEditar(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setConsultas(consultas.filter(consulta => consulta.id !== id));
    }
  };

  // Funções auxiliares para buscar nomes pelos IDs (para a tabela)
  const getPacienteNome = (id: number) => pacientes.find(p => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => medicos.find(m => m.id === id)?.nome || 'Não encontrado';
  
  // Formata a data para exibição na tabela
  const formatarData = (dataString: string) => {
    try {
      // Adiciona 'T00:00:00' para garantir que a data seja interpretada como local
      const data = new Date(dataString + 'T00:00:00');
      return data.toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  // Formata o valor monetário
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Registro de Consultas</h1>
        <button className="btn btn-primary" onClick={handleNew}>
          Nova Consulta
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Data da Consulta</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((consulta) => (
              <tr key={consulta.id}>
                <td>{consulta.protocolo}</td>
                <td>{getPacienteNome(consulta.pacienteId)}</td>
                <td>{getMedicoNome(consulta.medicoId)}</td>
                <td>{formatarData(consulta.dataConsulta)}</td>
                <td>{formatarValor(consulta.valorProcedimento)}</td>
                <td>
                  <span className={`status-badge status-${consulta.status.toLowerCase()}`}>
                    {consulta.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(consulta)}>
                    <FaPen />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(consulta.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar/Editar Consulta */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Registro de Consulta' : 'Novo Registro de Consulta'}>
        <form onSubmit={handleSubmit} className="form-modal">

          {/* Campos de Log - Visíveis e desabilitados apenas em modo de edição */}
          {isEditing && (
            <fieldset className="form-fieldset">
              <legend>Dados de Auditoria</legend>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="id">ID</label>
                  <input type="text" id="id" name="id" value={formData.id} readOnly disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="protocolo">Protocolo</label>
                  <input type="text" id="protocolo" name="protocolo" value={formData.protocolo} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Usuário Inclusão</label>
                  <input type="text" value={formData.usuarioInclusao} readOnly disabled />
                </div>
                <div className="form-group">
                  <label>Data Inclusão</label>
                  <input type="text" value={new Date(formData.dataInclusao).toLocaleString('pt-BR')} readOnly disabled />
                </div>
              </div>
              <div className="form-row">
                 <div className="form-group">
                  <label>Usuário Alteração</label>
                  <input type="text" value={formData.usuarioAlteracao} readOnly disabled />
                </div>
                <div className="form-group">
                  <label>Data Alteração</label>
                  <input type="text" value={new Date(formData.dataAlteracao).toLocaleString('pt-BR')} readOnly disabled />
                </div>
              </div>
            </fieldset>
          )}

          <fieldset className="form-fieldset">
            <legend>Dados da Consulta</legend>
            
            {!isEditing && (
              <div className="form-group">
                <label htmlFor="protocolo">Protocolo</label>
                <input type="text" id="protocolo" name="protocolo" value={formData.protocolo} onChange={handleChange} required />
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pacienteId">Nome do Paciente</label>
                <select id="pacienteId" name="pacienteId" value={formData.pacienteId} onChange={handleChange} required>
                  <option value={0} disabled>Selecione um paciente...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="medicoId">Médico</label>
                <select id="medicoId" name="medicoId" value={formData.medicoId} onChange={handleChange} required>
                  <option value={0} disabled>Selecione um médico...</option>
                  {medicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dataConsulta">Data da Consulta</label>
                <input type="date" id="dataConsulta" name="dataConsulta" value={formData.dataConsulta} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="consultorio">Consultório</label>
                <input type="text" id="consultorio" name="consultorio" value={formData.consultorio} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipoPagamento">Tipo de Pagamento</label>
                <select id="tipoPagamento" name="tipoPagamento" value={formData.tipoPagamento} onChange={handleChange} required>
                  <option value="" disabled>Selecione...</option>
                  <option value="particular">Particular</option>
                  <option value="convenio">Convênio</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="especialidade">Especialidade</label>
                <input type="text" id="especialidade" name="especialidade" value={formData.especialidade} onChange={handleChange} />
              </div>
            </div>
            
             <div className="form-row">
              <div className="form-group">
                <label htmlFor="valorProcedimento">Valor do Procedimento (R$)</label>
                <input type="number" step="0.01" id="valorProcedimento" name="valorProcedimento" value={formData.valorProcedimento} onChange={handleChange} required />
              </div>
              {/* Status só é editável no modo de edição */}
              {isEditing && (
                 <div className="form-group">
                  <label htmlFor="status">Status do Pagamento</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Glosado">Glosado</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="descricaoProcedimento">Descrição do Procedimento</label>
              <textarea id="descricaoProcedimento" name="descricaoProcedimento" value={formData.descricaoProcedimento} onChange={handleChange} rows={3}></textarea>
            </div>
          </fieldset>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RegistroConsultas;
