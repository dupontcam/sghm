import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Modal from './Modal';
import './CadastroMedicos.css';

type Paciente = {
  id: number;
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
};

const pacientesIniciais: Paciente[] = [
  { id: 1, nome: 'Ana Costa', dataNascimento: '1990-05-15', cpf: '111.222.333-44', email: 'ana.costa@email.com', telefone: '(11) 99999-8888' },
  { id: 2, nome: 'Carlos Souza', dataNascimento: '1985-11-20', cpf: '555.666.777-88', email: 'carlos.souza@email.com', telefone: '(21) 98888-7777' },
];

const CadastroPacientes: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);

  const handleNovoPaciente = () => {
    setPacienteEditando(null);
    setModalOpen(true);
  };

  const handleEditarPaciente = (paciente: Paciente) => {
    setPacienteEditando(paciente);
    setModalOpen(true);
  };

  const handleSalvar = (paciente: Paciente) => {
    console.log('Salvando:', paciente);
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cadastro de Pacientes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Pesquisar..." />
          </div>
          <button className="btn-primary" onClick={handleNovoPaciente}>+ Novo Paciente</button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Data de Nascimento</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientesIniciais.map(paciente => (
              <tr key={paciente.id}>
                <td>{paciente.nome}</td>
                <td>{paciente.dataNascimento}</td>
                <td>{paciente.cpf}</td>
                <td>{paciente.email}</td>
                <td>{paciente.telefone}</td>
                <td className="actions-cell">
                  <button className="icon-btn" onClick={() => handleEditarPaciente(paciente)}><FaEdit /></button>
                  <button className="icon-btn danger"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2>{pacienteEditando ? 'Editar Paciente' : 'Novo Paciente'}</h2>
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); handleSalvar(pacienteEditando || {} as Paciente); }}>
            <div className="form-group span-2">
              <label>Nome Completo</label>
              <input type="text" defaultValue={pacienteEditando?.nome} />
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input type="date" defaultValue={pacienteEditando?.dataNascimento} />
            </div>
            <div className="form-group">
              <label>CPF</label>
              <input type="text" defaultValue={pacienteEditando?.cpf} />
            </div>
            <div className="form-group span-2">
              <label>E-mail</label>
              <input type="email" defaultValue={pacienteEditando?.email} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="tel" defaultValue={pacienteEditando?.telefone} />
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

export default CadastroPacientes;
