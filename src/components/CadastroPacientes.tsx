import React, { useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Modal from './Modal';
import './Formulario.css';

// Define a estrutura de dados de um Paciente
// CORREÇÃO: Adicionamos 'export' aqui
export interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  convenio: string;
  carteirinha: string;
}

// --- DADOS DE EXEMPLO (MOCK) ---
// 'export' já estava correto aqui
export const mockPacientes: Paciente[] = [
  { id: 1, nome: 'Ana Silva', email: 'ana@email.com', telefone: '(61) 9888-1111', cpf: '123.456.789-10', convenio: 'Bradesco Saúde', carteirinha: '123456789' },
  { id: 2, nome: 'Bruno Costa', email: 'bruno@email.com', telefone: '(61) 9888-2222', cpf: '987.654.321-01', convenio: 'Amil', carteirinha: '987654321' },
  { id: 3, nome: 'Carla Dias', email: 'carla@email.com', telefone: '(61) 9888-3333', cpf: '555.666.777-88', convenio: 'SulAmérica', carteirinha: '555666777' },
];

// Estado inicial para o formulário
const formInicial: Paciente = {
  id: 0,
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  convenio: '',
  carteirinha: '',
};

const CadastroPacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState(mockPacientes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Paciente>(formInicial);

  // Abre o modal para um novo paciente
  const handleNovoPaciente = () => {
    setIsEditing(false);
    setFormData(formInicial);
    setIsModalOpen(true);
  };

  // Abre o modal para editar um paciente existente
  const handleEditarPaciente = (paciente: Paciente) => {
    setIsEditing(true);
    setFormData(paciente);
    setIsModalOpen(true);
  };

  // Fecha o modal e reseta o formulário
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Lida com a exclusão (simulada)
  const handleExcluirPaciente = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      setPacientes(pacientes.filter(p => p.id !== id));
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
      setPacientes(pacientes.map(p => (p.id === formData.id ? formData : p)));
      console.log('Paciente editado:', formData);
    } else {
      // Lógica de Criação
      const novoPaciente = { ...formData, id: pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1 };
      setPacientes([...pacientes, novoPaciente]);
      console.log('Novo paciente salvo:', novoPaciente);
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
              <th>Convênio</th>
              <th>Carteirinha nº</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome}</td>
                <td>{paciente.cpf}</td>
                <td>{paciente.convenio}</td>
                <td>{paciente.carteirinha}</td>
                <td>{paciente.telefone}</td>
                <td>
                  <button className="btn-icon" title="Editar" onClick={() => handleEditarPaciente(paciente)}>
                    <FaEdit />
                  </button>
                  <button className="btn-icon btn-delete" title="Excluir" onClick={() => handleExcluirPaciente(paciente.id)}>
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Inclusão/Edição */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Paciente' : 'Novo Paciente'}>
        <form onSubmit={handleSubmit} className="form-modal">
          {isEditing && (
            <div className="form-group">
              <label>ID do Paciente</label>
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
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="convenio">Convênio</label>
              <input
                id="convenio"
                name="convenio"
                type="text"
                value={formData.convenio}
                onChange={handleChange}
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="carteirinha">Carteirinha nº</label>
              <input
                id="carteirinha"
                name="carteirinha"
                type="text"
                value={formData.carteirinha}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Salvar Alterações' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CadastroPacientes;