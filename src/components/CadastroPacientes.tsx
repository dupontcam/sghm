import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import AlertModal from './AlertModal'; // 1. Importar o AlertModal
import { useData } from '../contexts/DataContext';
import { Paciente } from '../data/mockData';
import './Formulario.css';

const formInicial: Omit<Paciente, 'id'> = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  convenio: '',
  carteirinha: '',
};

const CadastroPacientes: React.FC = () => {
  const { pacientes, addPaciente, updatePaciente, deletePaciente } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<Paciente, 'id'> | Paciente>(formInicial);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  // 2. Estado para o modal de alerta
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const handleNovoPaciente = () => {
    setIsEditing(false);
    setFormData(formInicial);
    setIsModalOpen(true);
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    setIsEditing(true);
    setFormData(paciente);
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
      const sucesso = deletePaciente(confirmState.id); // Captura o retorno boolean

      if (!sucesso) {
        // Se falhou, define a mensagem de erro e abre o modal de alerta
        setAlertState({ 
          isOpen: true, 
          message: 'Este paciente não pode ser excluído, pois está associado a uma ou mais consultas registradas.' 
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
      updatePaciente(formData as Paciente);
    } else {
      addPaciente(formData as Omit<Paciente, 'id'>);
    }
    closeModal();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Pacientes</h1>
        <button className="btn btn-primary" onClick={handleNovoPaciente}>
          + Novo Paciente
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Convênio</th>
              <th>Nº Carteirinha</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome}</td>
                <td>{paciente.cpf}</td>
                <td>{paciente.telefone}</td>
                <td>{paciente.convenio}</td>
                <td>{paciente.carteirinha}</td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditarPaciente(paciente)}>
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Excluir"
                    onClick={() => handleExcluirClick(paciente.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Paciente' : 'Novo Paciente'}>
        <form onSubmit={handleSubmit} className="form-modal">
          {/* ... (conteúdo do formulário permanece o mesmo) ... */}
          {isEditing && (
            <div className="form-group">
              <label>ID do Paciente</label>
              <input type="text" value={'id' in formData ? formData.id : ''} disabled />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input id="nome" name="nome" type="text" value={formData.nome} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="cpf">CPF</label>
              <input id="cpf" name="cpf" type="text" value={formData.cpf} onChange={handleChange} required />
            </div>
            <div className="form-group half-width">
              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" name="telefone" type="tel" value={formData.telefone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="convenio">Convênio</label>
              <input id="convenio" name="convenio" type="text" value={formData.convenio} onChange={handleChange} />
            </div>
            <div className="form-group half-width">
              <label htmlFor="carteirinha">Nº Carteirinha</label>
              <input id="carteirinha" name="carteirinha" type="text" value={formData.carteirinha} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Salvar Alterações' : 'Salvar Paciente'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmarExclusao}
        title="Excluir Paciente"
        message="Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita."
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

export default CadastroPacientes;

