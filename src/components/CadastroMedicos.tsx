import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal'; // 1. Importar o AlertModal
import { useData } from '../contexts/DataContext';
import { Medico } from '../data/mockData';
import './Formulario.css';

// Estado inicial para o formulário
const formInicial: Omit<Medico, 'id'> = {
  nome: '',
  crm: '',
  cpf: '',
  especialidade: '',
  telefone: '',
  email: '',
};

const CadastroMedicos: React.FC = () => {
  const { medicos, addMedico, updateMedico, deleteMedico } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Medico, 'id'> | Medico>(formInicial);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  // 2. Estado para o modal de alerta
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const handleNovoMedico = () => {
    setIsEditing(false);
    setFormData(formInicial);
    setIsModalOpen(true);
  };

  const handleEditarMedico = (medico: Medico) => {
    setIsEditing(true);
    setFormData(medico);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleExcluirClick = (id: number) => {
    setConfirmState({ isOpen: true, id: id });
  };

  // 3. Lógica de exclusão atualizada
  const handleConfirmarExclusao = () => {
    if (confirmState.id !== null) {
      const sucesso = deleteMedico(confirmState.id); // Captura o retorno boolean
      
      if (!sucesso) {
        // Se falhou, define a mensagem de erro e abre o modal de alerta
        setAlertState({ 
          isOpen: true, 
          message: 'Este médico não pode ser excluído, pois está associado a uma ou mais consultas registradas.' 
        });
      }
    }
    // Fecha o modal de confirmação (independentemente do resultado)
    setConfirmState({ isOpen: false, id: null });
  };

  const handleCloseConfirm = () => {
    setConfirmState({ isOpen: false, id: null });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMedico(formData as Medico);
    } else {
      addMedico(formData as Omit<Medico, 'id'>);
    }
    closeModal();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Médicos</h1>
        <button className="btn btn-primary" onClick={handleNovoMedico}>
          + Novo Médico
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CRM</th>
              <th>CPF</th>
              <th>Especialidade</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((medico) => (
              <tr key={medico.id}>
                <td>{medico.id}</td>
                <td>{medico.nome}</td>
                <td>{medico.crm}</td>
                <td>{medico.cpf}</td>
                <td>{medico.especialidade}</td>
                <td>{medico.telefone}</td>
                <td>{medico.email}</td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditarMedico(medico)}>
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Excluir"
                    onClick={() => handleExcluirClick(medico.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Médico' : 'Novo Médico'}>
        <form onSubmit={handleSubmit} className="form-modal">
          {/* ... (conteúdo do formulário permanece o mesmo) ... */}
          {isEditing && (
            <div className="form-group">
              <label>ID do Médico</label>
              <input type="text" value={'id' in formData ? formData.id : ''} disabled />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="crm">CRM</label>
              <input id="crm" name="crm" type="text" value={formData.crm} onChange={handleChange} required />
            </div>
            <div className="form-group half-width">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" type="text" value={formData.cpf} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="especialidade">Especialidade</label>
            <input id="especialidade" name="especialidade" type="text" value={formData.especialidade} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleChange} />
            </div>
            <div className="form-group half-width">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Salvar Alterações' : 'Salvar Médico'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmarExclusao}
        title="Excluir Médico"
        message="Tem certeza que deseja excluir este médico? Esta ação não pode ser desfeita."
      />

      {/* 4. Renderizar o modal de alerta */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ isOpen: false, message: '' })}
        title="Erro na Exclusão"
        message={alertState.message}
      />
    </div>
  );
};

export default CadastroMedicos;
