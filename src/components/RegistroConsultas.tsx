import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import Modal from './Modal';
import './RegistroConsultas.css';

type Consulta = {
  id: number;
  paciente: string;
  medico: string;
  data: string;
  convenio: string;
  valor: string;
  status: 'Pendente' | 'Pago' | 'Glosado';
};

const consultasIniciais: Consulta[] = [
  { id: 1, paciente: 'Ana Costa', medico: 'Dr. João da Silva', data: '2025-10-18', convenio: 'SulAmérica', valor: 'R$ 350,00', status: 'Pago' },
  { id: 2, paciente: 'Carlos Souza', medico: 'Dra. Maria Oliveira', data: '2025-10-19', convenio: 'Bradesco Saúde', valor: 'R$ 400,00', status: 'Pendente' },
  { id: 3, paciente: 'Ana Costa', medico: 'Dra. Maria Oliveira', data: '2025-10-20', convenio: 'Particular', valor: 'R$ 500,00', status: 'Glosado' },
];

const medicos = [{ id: 1, nome: 'Dr. João da Silva' }, { id: 2, nome: 'Dra. Maria Oliveira' }];
const pacientes = [{ id: 1, nome: 'Ana Costa' }, { id: 2, nome: 'Carlos Souza' }];

const RegistroConsultas: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [consultaEditando, setConsultaEditando] = useState<Consulta | null>(null);

  const handleNovaConsulta = () => {
    setConsultaEditando(null);
    setModalOpen(true);
  };

  const handleEditarConsulta = (consulta: Consulta) => {
    setConsultaEditando(consulta);
    setModalOpen(true);
  };

  const handleSalvar = (consulta: Consulta) => {
    console.log('Salvando Consulta:', consulta);
    setModalOpen(false);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pago': return 'status-pago';
      case 'Pendente': return 'status-pendente';
      case 'Glosado': return 'status-glosado';
      default: return '';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Registro de Consultas</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Pesquisar..." />
          </div>
          <button className="btn-primary" onClick={handleNovaConsulta}>+ Nova Consulta</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Médico</th>
              <th>Data</th>
              <th>Convênio</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {consultasIniciais.map(consulta => (
              <tr key={consulta.id}>
                <td>{consulta.paciente}</td>
                <td>{consulta.medico}</td>
                <td>{consulta.data}</td>
                <td>{consulta.convenio}</td>
                <td>{consulta.valor}</td>
                <td><span className={`status-badge ${getStatusClass(consulta.status)}`}>{consulta.status}</span></td>
                <td className="actions-cell">
                  <button className="icon-btn" onClick={() => handleEditarConsulta(consulta)}><FaEdit /></button>
                  <button className="icon-btn danger"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h2>{consultaEditando ? 'Editar Consulta' : 'Nova Consulta'}</h2>
          <form className="form-grid" onSubmit={(e) => { e.preventDefault(); handleSalvar(consultaEditando || {} as Consulta); }}>
            <div className="form-group">
              <label>Paciente</label>
              <select defaultValue={consultaEditando?.paciente}>
                <option value="">Selecione um paciente</option>
                {pacientes.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Médico</label>
              <select defaultValue={consultaEditando?.medico}>
                <option value="">Selecione um médico</option>
                {medicos.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Data da Consulta</label>
              <input type="date" defaultValue={consultaEditando?.data} />
            </div>
            <div className="form-group">
              <label>Convênio</label>
              <input type="text" defaultValue={consultaEditando?.convenio} placeholder="ou 'Particular'" />
            </div>
            <div className="form-group">
              <label>Valor (R$)</label>
              <input type="text" defaultValue={consultaEditando?.valor} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select defaultValue={consultaEditando?.status}>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Glosado">Glosado</option>
              </select>
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

export default RegistroConsultas;
