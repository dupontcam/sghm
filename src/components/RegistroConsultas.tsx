import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import { Medico, mockMedicos } from './CadastroMedicos'; // Importa dados e o TIPO
import { Paciente, mockPacientes } from './CadastroPacientes'; // Importa dados e o TIPO
import './Formulario.css';
import './RegistroConsultas.css';

// Define a estrutura de dados de uma Consulta
// CORREÇÃO: Adicionamos 'export' aqui para que outros arquivos possam usar
export interface Consulta {
  id: number;
  usuarioInclusao: string;
  dataInclusao: string;
  usuarioAlteracao: string;
  dataAlteracao: string;
  status: 'Pendente' | 'Pago' | 'Glosado' | ''; // Tipo específico para o status
  // Dados do Formulário
  pacienteId: number;
  protocolo: string;
  consultorio: string;
  tipoPagamento: 'particular' | 'convenio' | ''; // Tipo específico
  medicoId: number;
  dataConsulta: string;
  especialidade: string;
  valorProcedimento: number;
  descricaoProcedimento: string;
}

// --- DADOS DE EXEMPLO (MOCK) ---
// 'export' já estava correto aqui
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

// Estado inicial para o formulário
const formInicial: Consulta = {
  id: 0,
  usuarioInclusao: '',
  dataInclusao: '',
  usuarioAlteracao: '',
  dataAlteracao: '',
  status: 'Pendente',
  pacienteId: 0,
  protocolo: '',
  consultorio: '',
  tipoPagamento: '',
  medicoId: 0,
  dataConsulta: '',
  especialidade: '',
  valorProcedimento: 0,
  descricaoProcedimento: '',
};

const RegistroConsultas: React.FC = () => {
  const [consultas, setConsultas] = useState(mockConsultas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Consulta>(formInicial);

  // Encontra o nome do paciente/médico pelo ID (para a tabela)
  // Corrigindo o TS7006 (implicit any)
  const getPacienteNome = (id: number) => mockPacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => mockMedicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';

  // Abre o modal para uma nova consulta
  const handleNovaConsulta = () => {
    setIsEditing(false);
    // Define os valores padrão para uma nova consulta
    const agora = new Date().toISOString();
    setFormData({
        ...formInicial,
        // No protótipo, simulamos o usuário logado
        usuarioInclusao: 'operador@sghm.com',
        dataInclusao: agora,
        usuarioAlteracao: 'operador@sghm.com',
        dataAlteracao: agora,
        status: 'Pendente', // Status padrão
    });
    setIsModalOpen(true);
  };

  // Abre o modal para editar uma consulta existente
  const handleEditarConsulta = (consulta: Consulta) => {
    setIsEditing(true);
    setFormData({
        ...consulta,
        // Simula a atualização dos dados de alteração
        usuarioAlteracao: 'admin@sghm.com', // Simula um usuário diferente editando
        dataAlteracao: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  // Fecha o modal e reseta o formulário
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Lida com a exclusão (simulada)
  const handleExcluirConsulta = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de consulta?')) {
      setConsultas(consultas.filter(c => c.id !== id));
    }
  };

  // Lida com as mudanças nos inputs do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Processa o valor com base no nome do campo
    let valorProcessado: string | number = value;

    if (name === 'valorProcedimento' || name === 'pacienteId' || name === 'medicoId') {
      valorProcessado = parseFloat(value) || 0;
    }

    setFormData({
      ...formData,
      [name]: valorProcessado,
    });
  };

  // Lida com o submit do formulário (Adicionar ou Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // CORREÇÃO: Força a tipagem correta antes de salvar
    // Isso garante que os tipos de 'status' e 'tipoPagamento' estejam corretos
    const dadosFormatados: Consulta = {
        ...formData,
        status: formData.status as Consulta['status'],
        tipoPagamento: formData.tipoPagamento as Consulta['tipoPagamento'],
        valorProcedimento: Number(formData.valorProcedimento) // Garante que é número
    };

    if (isEditing) {
      // Lógica de Edição
      const consultaAtualizada: Consulta = {
          ...dadosFormatados,
          usuarioAlteracao: 'admin@sghm.com', // Simula usuário admin
          dataAlteracao: new Date().toISOString()
      };
      setConsultas(consultas.map(c => (c.id === consultaAtualizada.id ? consultaAtualizada : c)));
      console.log('Consulta editada:', consultaAtualizada);
    } else {
      // Lógica de Criação
      const novaConsulta: Consulta = {
          ...dadosFormatados,
          id: consultas.length > 0 ? Math.max(...consultas.map(c => c.id)) + 1 : 1
      };
      setConsultas([...consultas, novaConsulta]);
      console.log('Nova consulta salva:', novaConsulta);
    }
    closeModal();
  };


  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Registro de Consultas</h1>
        <button className="btn btn-primary" onClick={handleNovaConsulta}>
          + Nova Consulta
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Data</th>
              <th>Valor (R$)</th>
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
                <td>{new Date(consulta.dataConsulta).toLocaleDateString()}</td>
                <td>{consulta.valorProcedimento.toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${consulta.status.toLowerCase()}`}>
                    {consulta.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditarConsulta(consulta)}>
                    <FaEdit />
                  </button>
                  <button className="btn-icon btn-delete" title="Excluir" onClick={() => handleExcluirConsulta(consulta.id)}>
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Inclusão/Edição */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Consulta' : 'Nova Consulta'}>
        <form onSubmit={handleSubmit} className="form-modal">
          
          {/* Campos de Auditoria (Visíveis apenas na edição) */}
          {isEditing && (
            <fieldset>
              <legend>Dados de Auditoria</legend>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>ID da Consulta</label>
                  <input type="text" value={formData.id} disabled />
                </div>
                <div className="form-group half-width">
                  <label>Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Pago">Pago</option>
                    <option value="Glosado">Glosado</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Usuário Inclusão</label>
                  <input type="text" value={formData.usuarioInclusao} disabled />
                </div>
                <div className="form-group half-width">
                  <label>Data Inclusão</label>
                  <input type="text" value={new Date(formData.dataInclusao).toLocaleString()} disabled />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Usuário Alteração</label>
                  <input type="text" value={formData.usuarioAlteracao} disabled />
                </div>
                <div className="form-group half-width">
                  <label>Data Alteração</label>
                  <input type="text" value={new Date(formData.dataAlteracao).toLocaleString()} disabled />
                </div>
              </div>
            </fieldset>
          )}

          {/* Dados da Consulta */}
          <fieldset>
            <legend>Dados da Consulta</legend>
            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="pacienteId">Nome do Paciente</label>
                    <select
                        id="pacienteId"
                        name="pacienteId"
                        value={formData.pacienteId}
                        onChange={handleChange}
                        required
                    >
                        <option value={0} disabled>Selecione...</option>
                        {mockPacientes.map((p: Paciente) => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group half-width">
                    <label htmlFor="protocolo">Protocolo</label>
                    <input
                        id="protocolo"
                        name="protocolo"
                        type="text"
                        value={formData.protocolo}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="consultorio">Consultório</label>
                    <input
                        id="consultorio"
                        name="consultorio"
                        type="text"
                        value={formData.consultorio}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group half-width">
                    <label htmlFor="tipoPagamento">Tipo de Pagamento</label>
                    <select
                        id="tipoPagamento"
                        name="tipoPagamento"
                        value={formData.tipoPagamento}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Selecione...</option>
                        <option value="particular">Particular</option>
                        <option value="convenio">Convênio</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="medicoId">Médico</label>
                    <select
                        id="medicoId"
                        name="medicoId"
                        value={formData.medicoId}
                        onChange={handleChange}
                        required
                    >
                        <option value={0} disabled>Selecione...</option>
                        {mockMedicos.map((m: Medico) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group half-width">
                    <label htmlFor="dataConsulta">Data da Consulta</label>
                    <input
                        id="dataConsulta"
                        name="dataConsulta"
                        type="date"
                        value={formData.dataConsulta}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group half-width">
                    <label htmlFor="especialidade">Especialidade</label>
                    <input
                        id="especialidade"
                        name="especialidade"
                        type="text"
                        value={formData.especialidade}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group half-width">
                    <label htmlFor="valorProcedimento">Valor do Procedimento (R$)</label>
                    <input
                        id="valorProcedimento"
                        name="valorProcedimento"
                        type="number"
                        step="0.01"
                        value={formData.valorProcedimento}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="descricaoProcedimento">Descrição do Procedimento</label>
                <textarea
                    id="descricaoProcedimento"
                    name="descricaoProcedimento"
                    rows={3}
                    value={formData.descricaoProcedimento}
                    onChange={handleChange}
                ></textarea>
            </div>
          </fieldset>

          <div className="form-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Salvar Alterações' : 'Salvar Consulta'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RegistroConsultas;