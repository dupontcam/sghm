import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal'; // 1. Importar
import { useData } from '../contexts/DataContext';
import { Consulta, Medico, Paciente } from '../data/mockData';
import './Formulario.css';
import './RegistroConsultas.css';

const formInicial: Omit<Consulta, 'id'> = {
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
  const { 
    consultas, addConsulta, updateConsulta, deleteConsulta, 
    medicos, pacientes 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Consulta, 'id'> | Consulta>(formInicial);

  // 2. Estado para o modal de confirmação
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  const getPacienteNome = (id: number) => pacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => medicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';

  const handleNovaConsulta = () => {
    setIsEditing(false);
    setFormData({
        ...formInicial,
    });
    setIsModalOpen(true);
  };

  const handleEditarConsulta = (consulta: Consulta) => {
    setIsEditing(true);
    setFormData({
        ...consulta,
        usuarioAlteracao: 'admin@sghm.com',
        dataAlteracao: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 3. Abrir o modal de confirmação
  const handleExcluirClick = (id: number) => {
    setConfirmState({ isOpen: true, id: id });
  };

  // 4. Ação de confirmar
  const handleConfirmarExclusao = () => {
    if (confirmState.id !== null) {
      deleteConsulta(confirmState.id);
    }
    setConfirmState({ isOpen: false, id: null });
  };

  // 5. Ação de fechar o modal de confirmação
  const handleCloseConfirm = () => {
    setConfirmState({ isOpen: false, id: null });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let valorProcessado: string | number = value;

    if (name === 'valorProcedimento' || name === 'pacienteId' || name === 'medicoId') {
      valorProcessado = parseFloat(value) || 0;
    }

    setFormData({
      ...formData,
      [name]: valorProcessado,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dadosFormatados = {
        ...formData,
        status: formData.status as Consulta['status'],
        tipoPagamento: formData.tipoPagamento as Consulta['tipoPagamento'],
        valorProcedimento: Number(formData.valorProcedimento)
    };

    if (isEditing) {
      const consultaAtualizada = {
          ...dadosFormatados,
          usuarioAlteracao: 'admin@sghm.com',
          dataAlteracao: new Date().toISOString()
      } as Consulta; 

      updateConsulta(consultaAtualizada);
      
    } else {
      const novaConsulta = {
          ...dadosFormatados,
          usuarioInclusao: 'operador@sghm.com',
          dataInclusao: new Date().toISOString(),
          usuarioAlteracao: 'operador@sghm.com',
          dataAlteracao: new Date().toISOString(),
      } as Omit<Consulta, 'id'>; 

      addConsulta(novaConsulta);
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
                  <button
                    className="btn-icon btn-delete"
                    title="Excluir"
                    onClick={() => handleExcluirClick(consulta.id)} // 6. Chamar o clique
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Consulta' : 'Nova Consulta'}>
        <form onSubmit={handleSubmit} className="form-modal">
          
          {isEditing && (
            <fieldset>
              <legend>Dados de Auditoria</legend>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>ID da Consulta</label>
                  <input type="text" value={'id' in formData ? formData.id : ''} disabled />
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
              {'id' in formData && ( 
                <>
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
                </>
              )}
            </fieldset>
          )}

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
                        {pacientes.map((p: Paciente) => (
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
                        {medicos.map((m: Medico) => (
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

      {/* 7. Renderizar o modal de confirmação */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmarExclusao}
        title="Excluir Consulta"
        message="Tem certeza que deseja excluir este registro de consulta? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default RegistroConsultas;
