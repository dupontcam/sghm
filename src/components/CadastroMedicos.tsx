import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import './Formulario.css';

// Define a estrutura de dados de um Médico
// CORREÇÃO: Adicionamos 'export' aqui
export interface Medico {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  crm: string;
  cpf: string; // Campo Adicionado
  especialidade: string;
}

// --- DADOS DE EXEMPLO (MOCK) ---
// 'export' já estava correto aqui
export const mockMedicos: Medico[] = [
  { id: 1, nome: 'Dr. Carlos Alberto', email: 'carlos@med.com', telefone: '(61) 9999-1111', crm: '12345-DF', cpf: '111.222.333-44', especialidade: 'Cardiologia' },
  { id: 2, nome: 'Dra. Ana Sousa', email: 'ana@med.com', telefone: '(61) 9999-2222', crm: '54321-DF', cpf: '222.333.444-55', especialidade: 'Dermatologia' },
];

// Estado inicial para o formulário
const formInicial: Medico = {
  id: 0,
  nome: '',
  email: '',
  telefone: '',
  crm: '',
  cpf: '',
  especialidade: '',
};

const CadastroMedicos: React.FC = () => {
  const [medicos, setMedicos] = useState(mockMedicos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Medico>(formInicial);

  // Abre o modal para um novo médico
  const handleNovoMedico = () => {
    setIsEditing(false);
    setFormData(formInicial);
    setIsModalOpen(true);
  };

  // Abre o modal para editar um médico existente
  const handleEditarMedico = (medico: Medico) => {
    setIsEditing(true);
    setFormData(medico);
    setIsModalOpen(true);
  };

  // Fecha o modal e reseta o formulário
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Lida com a exclusão (simulada)
  const handleExcluirMedico = (id: number) => {
    // Usamos 'confirm' por ser um protótipo, mas o ideal é um modal de confirmação
    if (window.confirm('Tem certeza que deseja excluir este médico?')) {
      setMedicos(medicos.filter(m => m.id !== id));
    }
  };

  // Lida com as mudanças nos inputs do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Lida com o submit do formulário (Adicionar ou Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      // Lógica de Edição
      setMedicos(medicos.map(m => (m.id === formData.id ? formData : m)));
      console.log('Médico editado:', formData);
    } else {
      // Lógica de Criação
      const novoMedico = { ...formData, id: medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1 };
      setMedicos([...medicos, novoMedico]);
      console.log('Novo médico salvo:', novoMedico);
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
              <th>Email</th>
              <th>CRM</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((medico) => (
              <tr key={medico.id}>
                <td>{medico.id}</td>
                <td>{medico.nome}</td>
                <td>{medico.email}</td>
                <td>{medico.crm}</td>
                <td>{medico.cpf}</td>
                <td>{medico.telefone}</td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditarMedico(medico)}>
                    <FaEdit />
                  </button>
                  <button className="btn-icon btn-delete" title="Excluir" onClick={() => handleExcluirMedico(medico.id)}>
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Inclusão/Edição */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Médico' : 'Novo Médico'}>
        <form onSubmit={handleSubmit} className="form-modal">
          {isEditing && (
            <div className="form-group">
              <label>ID do Médico</label>
              <input type="text" value={formData.id} disabled />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="text"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="crm">CRM</label>
              <input
                id="crm"
                name="crm"
                type="text"
                value={formData.crm}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="especialidade">Especialidade</label>
            <input
              id="especialidade"
              name="especialidade"
              type="text"
              value={formData.especialidade}
              onChange={handleChange}
            />
          </div>

          <div className="form-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Salvar Alterações' : 'Salvar Médico'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CadastroMedicos;