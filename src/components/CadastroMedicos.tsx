import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Modal from './Modal';
import './CadastroMedicos.css';
import './Formulario.css';

type Medico = {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
  email: string;
  telefone: string;
};

const medicosIniciais: Medico[] = [
  { id: 1, nome: 'Dr. João da Silva', crm: '12345-SP', especialidade: 'Cardiologia', email: 'joao.silva@email.com', telefone: '(11) 98765-4321' },
  { id: 2, nome: 'Dra. Maria Oliveira', crm: '54321-RJ', especialidade: 'Pediatria', email: 'maria.o@email.com', telefone: '(21) 91234-5678' },
];

const CadastroMedicos: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [medicoEditando, setMedicoEditando] = useState<Medico | null>(null);

  const handleNovoMedico = () => {
    setMedicoEditando(null);
    setModalOpen(true);
  };

  const handleEditarMedico = (medico: Medico) => {
    setMedicoEditando(medico);
    setModalOpen(true);
  };

  const handleSalvar = (medico: Medico) => {
    console.log('Salvando:', medico);
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Médicos</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Pesquisar..." />
          </div>
          <button className="btn-primary" onClick={handleNovoMedico}>+ Novo Médico</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CRM</th>
              <th>Especialidade</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {medicosIniciais.map(medico => (
              <tr key={medico.id}>
                <td>{medico.nome}</td>
                <td>{medico.crm}</td>
                <td>{medico.especialidade}</td>
                <td>{medico.email}</td>
                <td>{medico.telefone}</td>
                <td className="actions-cell">
                  <button className="icon-btn" onClick={() => handleEditarMedico(medico)}><FaEdit /></button>
                  <button className="icon-btn danger"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2>{medicoEditando ? 'Editar Médico' : 'Novo Médico'}</h2>
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); handleSalvar(medicoEditando || {} as Medico); }}>
            <div className="form-group span-2">
              <label>Nome Completo</label>
              <input type="text" defaultValue={medicoEditando?.nome} />
            </div>
            <div className="form-group">
              <label>CRM</label>
              <input type="text" defaultValue={medicoEditando?.crm} />
            </div>
            <div className="form-group">
              <label>Especialidade</label>
              <input type="text" defaultValue={medicoEditando?.especialidade} />
            </div>
            <div className="form-group span-2">
              <label>E-mail</label>
              <input type="email" defaultValue={medicoEditando?.email} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="tel" defaultValue={medicoEditando?.telefone} />
            </div>
            <div className="form-actions span-2">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Salvar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CadastroMedicos;
