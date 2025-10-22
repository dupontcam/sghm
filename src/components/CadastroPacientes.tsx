import React, { useState } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';
import Modal from './Modal';
import './Formulario.css'; // Importa os estilos do formulário

// Tipo de dados para Paciente
interface Paciente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  convenio: string;      // Novo campo
  carteirinha: string; // Novo campo
}

// Dados de exemplo
const mockPacientes: Paciente[] = [
  { id: 1, nome: 'Daniel Torres', email: 'daniel@email.com', telefone: '(61) 99999-8888', convenio: 'SaúdeSempre', carteirinha: '123456789' },
  { id: 2, nome: 'Dionismar Rodrigues', email: 'dionismar@email.com', telefone: '(61) 98888-7777', convenio: 'BemEstar', carteirinha: '987654321' },
];

const CadastroPacientes: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacientes, setPacientes] = useState(mockPacientes);
  const [pacienteParaEditar, setPacienteParaEditar] = useState<Paciente | null>(null);

  // Estado inicial do formulário, incluindo os novos campos
  const estadoInicialFormulario: Paciente = {
    id: 0,
    nome: '',
    email: '',
    telefone: '',
    convenio: '',
    carteirinha: '',
  };

  const [formData, setFormData] = useState<Paciente>(estadoInicialFormulario);
  const [isEditing, setIsEditing] = useState(false);

  // Gerenciador de mudanças nos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Salva o formulário (simulação)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && pacienteParaEditar) {
      // Lógica de Edição
      setPacientes(pacientes.map(paciente =>
        paciente.id === pacienteParaEditar.id ? formData : paciente
      ));
      console.log('Paciente atualizado:', formData);
    } else {
      // Lógica de Criação
      const novoPaciente = { ...formData, id: Math.floor(Math.random() * 1000) };
      setPacientes([...pacientes, novoPaciente]);
      console.log('Novo paciente salvo:', novoPaciente);
    }
    closeModal();
  };

  // Abre o modal para um novo paciente
  const handleNew = () => {
    setFormData(estadoInicialFormulario);
    setPacienteParaEditar(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Abre o modal para editar um paciente
  const handleEdit = (paciente: Paciente) => {
    setFormData(paciente);
    setPacienteParaEditar(paciente);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setPacienteParaEditar(null);
  };

  // (Simulação) Deleta um paciente
  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      setPacientes(pacientes.filter(paciente => paciente.id !== id));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Pacientes</h1>
        <button className="btn btn-primary" onClick={handleNew}>
          Novo Paciente
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Convênio</th>
              <th>Carteirinha Nº</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>{paciente.id}</td>
                <td>{paciente.nome}</td>
                <td>{paciente.email}</td>
                <td>{paciente.telefone}</td>
                <td>{paciente.convenio}</td>
                <td>{paciente.carteirinha}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(paciente)}>
                    <FaPen />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(paciente.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar/Editar */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Paciente' : 'Novo Paciente'}>
        <form onSubmit={handleSubmit} className="form-modal">

          {isEditing && (
            <div className="form-group">
              <label htmlFor="id">ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                readOnly
                disabled
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="convenio">Convênio</label>
              <input
                type="text"
                id="convenio"
                name="convenio"
                value={formData.convenio}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="carteirinha">Carteirinha Nº</label>
              <input
                type="text"
                id="carteirinha"
                name="carteirinha"
                value={formData.carteirinha}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CadastroPacientes;
