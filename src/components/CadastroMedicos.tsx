import React, { useState } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';
import Modal from './Modal';
import './Formulario.css'; // Importa os estilos do formulário

// Tipo de dados para Médico
interface Medico {
  id: number;
  cpf: string; // Novo campo
  nome: string;
  email: string;
  crm: string;
  especialidade: string;
}

// Dados de exemplo
const mockMedicos: Medico[] = [
  { id: 1, nome: 'Dr. Carlos Alberto', email: 'carlos@med.com', crm: '12345-DF', especialidade: 'Cardiologia', cpf: '111.222.333-44' },
  { id: 2, nome: 'Dra. Karyne Sousa', email: 'karyne@med.com', crm: '54321-DF', especialidade: 'Neurologia', cpf: '444.555.666-77' },
];

const CadastroMedicos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicos, setMedicos] = useState(mockMedicos);
  const [medicoParaEditar, setMedicoParaEditar] = useState<Medico | null>(null);

  // Estado inicial do formulário, incluindo os novos campos
  const estadoInicialFormulario: Medico = {
    id: 0,
    nome: '',
    email: '',
    crm: '',
    especialidade: '',
    cpf: '',
  };

  const [formData, setFormData] = useState<Medico>(estadoInicialFormulario);

  // Controla se o ID deve ser visível (apenas em modo de edição)
  const [isEditing, setIsEditing] = useState(false);

  // Gerenciador de mudanças nos inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Salva o formulário (simulação)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && medicoParaEditar) {
      // Lógica de Edição
      setMedicos(medicos.map(medico =>
        medico.id === medicoParaEditar.id ? formData : medico
      ));
      console.log('Médico atualizado:', formData);
    } else {
      // Lógica de Criação (simulando um novo ID)
      const novoMedico = { ...formData, id: Math.floor(Math.random() * 1000) };
      setMedicos([...medicos, novoMedico]);
      console.log('Novo médico salvo:', novoMedico);
    }
    closeModal();
  };

  // Abre o modal para um novo médico
  const handleNew = () => {
    setFormData(estadoInicialFormulario);
    setMedicoParaEditar(null);
    setIsEditing(false); // Não está editando
    setIsModalOpen(true);
  };

  // Abre o modal para editar um médico
  const handleEdit = (medico: Medico) => {
    setFormData(medico);
    setMedicoParaEditar(medico);
    setIsEditing(true); // Está editando
    setIsModalOpen(true);
  };

  // Fecha o modal
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setMedicoParaEditar(null);
  };

  // (Simulação) Deleta um médico
  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este médico?')) {
      setMedicos(medicos.filter(medico => medico.id !== id));
    }
  };


  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Médicos</h1>
        <button className="btn btn-primary" onClick={handleNew}>
          Novo Médico
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Email</th>
              <th>CRM</th>
              <th>Especialidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((medico) => (
              <tr key={medico.id}>
                <td>{medico.id}</td>
                <td>{medico.nome}</td>
                <td>{medico.cpf}</td>
                <td>{medico.email}</td>
                <td>{medico.crm}</td>
                <td>{medico.especialidade}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(medico)}>
                    <FaPen />
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(medico.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Adicionar/Editar */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Médico' : 'Novo Médico'}>
        <form onSubmit={handleSubmit} className="form-modal">
          
          {/* Campo de ID (somente visível e desabilitado em modo de edição) */}
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
            <label htmlFor="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="crm">CRM</label>
              <input
                type="text"
                id="crm"
                name="crm"
                value={formData.crm}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="especialidade">Especialidade</label>
              <input
                type="text"
                id="especialidade"
                name="especialidade"
                value={formData.especialidade}
                onChange={handleChange}
                required
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

export default CadastroMedicos;