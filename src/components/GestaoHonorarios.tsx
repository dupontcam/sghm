import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Honorario } from '../data/mockData';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { 
  FaPlus, FaEdit, FaTrash, FaFilter, FaFileAlt,
  FaClock, FaPaperPlane, FaCheck, FaTimes, FaSearch 
} from 'react-icons/fa';
import './GestaoHonorarios.css';

const GestaoHonorarios: React.FC = () => {
  const { 
    honorarios, addHonorario, updateHonorario, deleteHonorario,
    medicos, planosSaude
  } = useData();

  // Estados do componente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [editingHonorario, setEditingHonorario] = useState<Honorario | null>(null);
  const [honorarioToDelete, setHonorarioToDelete] = useState<Honorario | null>(null);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    medico: '',
    planoSaude: '',
    status: 'TODOS',
    dataInicio: '',
    dataFim: '',
    busca: ''
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    medicoId: 0,
    consultaId: 0,
    planoSaudeId: 0,
    dataConsulta: '',
    valor: 0,
    status: 'PENDENTE' as Honorario['status'],
    motivo: ''
  });

  // Honorários filtrados
  const honorariosFiltrados = useMemo(() => {
    return honorarios.filter(honorario => {
      const medico = medicos.find(m => m.id === honorario.medicoId);
      const plano = planosSaude.find(p => p.id === honorario.planoSaudeId);
      
      const matchMedico = !filtros.medico || honorario.medicoId.toString() === filtros.medico;
      const matchPlano = !filtros.planoSaude || honorario.planoSaudeId.toString() === filtros.planoSaude;
      const matchStatus = filtros.status === 'TODOS' || honorario.status === filtros.status;
      
      const dataConsulta = new Date(honorario.dataConsulta);
      const matchDataInicio = !filtros.dataInicio || dataConsulta >= new Date(filtros.dataInicio);
      const matchDataFim = !filtros.dataFim || dataConsulta <= new Date(filtros.dataFim);
      
      const matchBusca = !filtros.busca || 
        medico?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        plano?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        honorario.motivo?.toLowerCase().includes(filtros.busca.toLowerCase());
      
      return matchMedico && matchPlano && matchStatus && matchDataInicio && matchDataFim && matchBusca;
    });
  }, [honorarios, filtros, medicos, planosSaude]);

  // Estatísticas dos honorários filtrados
  const estatisticasFiltradas = useMemo(() => {
    const total = honorariosFiltrados.reduce((acc, h) => acc + h.valor, 0);
    const pendente = honorariosFiltrados.filter(h => h.status === 'PENDENTE').reduce((acc, h) => acc + h.valor, 0);
    const pago = honorariosFiltrados.filter(h => h.status === 'PAGO').reduce((acc, h) => acc + h.valor, 0);
    const glosado = honorariosFiltrados.filter(h => h.status === 'GLOSADO').reduce((acc, h) => acc + h.valor, 0);
    
    return { total, pendente, pago, glosado, quantidade: honorariosFiltrados.length };
  }, [honorariosFiltrados]);

  // Abrir modal para novo honorário
  // Abrir modal para editar honorário
  const handleEditarHonorario = (honorario: Honorario) => {
    setEditingHonorario(honorario);
    setFormData({
      medicoId: honorario.medicoId,
      consultaId: honorario.consultaId,
      planoSaudeId: honorario.planoSaudeId,
      dataConsulta: honorario.dataConsulta,
      valor: honorario.valor,
      status: honorario.status,
      motivo: honorario.motivo || ''
    });
    setIsModalOpen(true);
  };

  // Salvar honorário (apenas edição)
  const handleSalvarHonorario = () => {
    if (!editingHonorario) {
      alert('Erro: Nenhum honorário sendo editado.');
      return;
    }

    if (!formData.medicoId || !formData.planoSaudeId || !formData.dataConsulta || !formData.valor) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Editar honorário existente
    const honorarioAtualizado: Honorario = {
      ...editingHonorario,
      ...formData,
      updatedAt: new Date().toISOString()
    };
    updateHonorario(honorarioAtualizado);

    setIsModalOpen(false);
    resetForm();
  };

  // Reset do formulário
  const resetForm = () => {
    setFormData({
      medicoId: 0,
      consultaId: 0,
      planoSaudeId: 0,
      dataConsulta: '',
      valor: 0,
      status: 'PENDENTE',
      motivo: ''
    });
  };

  // Confirmar exclusão
  const handleConfirmarExclusao = (honorario: Honorario) => {
    setHonorarioToDelete(honorario);
    setIsConfirmationOpen(true);
  };

  // Executar exclusão
  const handleExcluirHonorario = () => {
    if (honorarioToDelete) {
      deleteHonorario(honorarioToDelete.id);
      setIsConfirmationOpen(false);
      setHonorarioToDelete(null);
    }
  };

  // Alterar status do honorário
  const handleAlterarStatus = (honorario: Honorario, novoStatus: Honorario['status']) => {
    const honorarioAtualizado: Honorario = {
      ...honorario,
      status: novoStatus,
      updatedAt: new Date().toISOString()
    };
    updateHonorario(honorarioAtualizado);
  };

  // Limpar filtros
  const handleLimparFiltros = () => {
    setFiltros({
      medico: '',
      planoSaude: '',
      status: 'TODOS',
      dataInicio: '',
      dataFim: '',
      busca: ''
    });
  };

  // Obter dados relacionados
  const getMedicoNome = (id: number) => medicos.find(m => m.id === id)?.nome || 'Médico não encontrado';
  const getPlanoNome = (id: number) => planosSaude.find(p => p.id === id)?.nome || 'Plano não encontrado';

  // Ícone de status
  const getStatusIcon = (status: Honorario['status']) => {
    switch (status) {
      case 'PENDENTE': return <FaClock className="status-pendente" />;
      case 'ENVIADO': return <FaPaperPlane className="status-enviado" />;
      case 'PAGO': return <FaCheck className="status-pago" />;
      case 'GLOSADO': return <FaTimes className="status-glosado" />;
      default: return <FaClock />;
    }
  };

  return (
    <div className="gestao-honorarios-container">
      <div className="page-header">
        <div className="header-info">
          <h1>Gestão de Honorários Médicos</h1>
          <div className="header-stats">
            <span className="stat-item">Total: R$ {estatisticasFiltradas.total.toFixed(2)}</span>
            <span className="stat-item">{estatisticasFiltradas.quantidade} honorários</span>
          </div>
        </div>
        <div className="header-note">
          <span>💡 Honorários são criados automaticamente ao registrar consultas por convênio</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-row">
          <div className="filtro-grupo">
            <label>Buscar:</label>
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                placeholder="Médico, plano, motivo..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>
          </div>
          
          <div className="filtro-grupo">
            <label>Médico:</label>
            <select value={filtros.medico} onChange={(e) => setFiltros({ ...filtros, medico: e.target.value })}>
              <option value="">Todos os médicos</option>
              {medicos.map(medico => (
                <option key={medico.id} value={medico.id}>{medico.nome}</option>
              ))}
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label>Plano de Saúde:</label>
            <select value={filtros.planoSaude} onChange={(e) => setFiltros({ ...filtros, planoSaude: e.target.value })}>
              <option value="">Todos os planos</option>
              {planosSaude.map(plano => (
                <option key={plano.id} value={plano.id}>{plano.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Status:</label>
            <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
              <option value="TODOS">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ENVIADO">Enviado</option>
              <option value="PAGO">Pago</option>
              <option value="GLOSADO">Glosado</option>
            </select>
          </div>
        </div>

        <div className="filtros-row filtros-row-secondary">
          <div className="filtro-grupo">
            <label>Data Início:</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>
          
          <div className="filtro-grupo">
            <label>Data Fim:</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            />
          </div>
          
          <div className="filtro-grupo filtro-actions-container">
            <div className="filtro-actions">
              <button className="btn-secondary" onClick={handleLimparFiltros}>
                <FaFilter /> Limpar Filtros
              </button>
            </div>
          </div>
          
          <div className="filtro-grupo"></div> {/* Espaço vazio para alinhamento */}
        </div>
      </div>

      {/* Resumo das Estatísticas */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-value">R$ {estatisticasFiltradas.total.toFixed(2)}</div>
          <div className="stat-label">Total Processado</div>
        </div>
        <div className="stat-card pendente">
          <div className="stat-value">R$ {estatisticasFiltradas.pendente.toFixed(2)}</div>
          <div className="stat-label">Pendente</div>
        </div>
        <div className="stat-card pago">
          <div className="stat-value">R$ {estatisticasFiltradas.pago.toFixed(2)}</div>
          <div className="stat-label">Pago</div>
        </div>
        <div className="stat-card glosado">
          <div className="stat-value">R$ {estatisticasFiltradas.glosado.toFixed(2)}</div>
          <div className="stat-label">Glosado</div>
        </div>
      </div>

      {/* Lista de Honorários */}
      <div className="honorarios-table-container">
        {honorariosFiltrados.length > 0 ? (
          <table className="honorarios-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Médico</th>
                <th>Plano de Saúde</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Motivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {honorariosFiltrados.map(honorario => (
                <tr key={honorario.id} className={`honorario-row status-${honorario.status.toLowerCase()}`}>
                  <td>{new Date(honorario.dataConsulta).toLocaleDateString('pt-BR')}</td>
                  <td>{getMedicoNome(honorario.medicoId)}</td>
                  <td>{getPlanoNome(honorario.planoSaudeId)}</td>
                  <td className="valor">R$ {honorario.valor.toFixed(2)}</td>
                  <td>
                    <div className="status-container">
                      {getStatusIcon(honorario.status)}
                      <span className={`status-text status-${honorario.status.toLowerCase()}`}>
                        {honorario.status}
                      </span>
                    </div>
                  </td>
                  <td>{honorario.motivo || '-'}</td>
                  <td>
                    <div className="actions-container">
                      {honorario.status === 'PENDENTE' && (
                        <button
                          className="btn-icon success"
                          onClick={() => handleAlterarStatus(honorario, 'ENVIADO')}
                          title="Enviar"
                        >
                          <FaPaperPlane />
                        </button>
                      )}
                      {honorario.status === 'ENVIADO' && (
                        <>
                          <button
                            className="btn-icon success"
                            onClick={() => handleAlterarStatus(honorario, 'PAGO')}
                            title="Marcar como Pago"
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => handleAlterarStatus(honorario, 'GLOSADO')}
                            title="Marcar como Glosado"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        className="btn-icon edit"
                        onClick={() => handleEditarHonorario(honorario)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleConfirmarExclusao(honorario)}
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <FaFileAlt />
            <p>Nenhum honorário encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Editar Honorário"
      >
        <div className="form-group">
          <label>Médico *:</label>
          <select
            value={formData.medicoId}
            onChange={(e) => setFormData({ ...formData, medicoId: Number(e.target.value) })}
            required
          >
            <option value={0}>Selecione um médico</option>
            {medicos.map(medico => (
              <option key={medico.id} value={medico.id}>{medico.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Plano de Saúde *:</label>
          <select
            value={formData.planoSaudeId}
            onChange={(e) => setFormData({ ...formData, planoSaudeId: Number(e.target.value) })}
            required
          >
            <option value={0}>Selecione um plano</option>
            {planosSaude.map(plano => (
              <option key={plano.id} value={plano.id}>{plano.nome}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Data da Consulta *:</label>
            <input
              type="date"
              value={formData.dataConsulta}
              onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Valor *:</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Status:</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Honorario['status'] })}
          >
            <option value="PENDENTE">Pendente</option>
            <option value="ENVIADO">Enviado</option>
            <option value="PAGO">Pago</option>
            <option value="GLOSADO">Glosado</option>
          </select>
        </div>

        {(formData.status === 'GLOSADO' || editingHonorario?.status === 'GLOSADO') && (
          <div className="form-group">
            <label>Motivo da Glosa:</label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Descreva o motivo da glosa..."
              rows={3}
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSalvarHonorario}>
            {editingHonorario ? 'Atualizar' : 'Criar'} Honorário
          </button>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir este honorário de R$ ${honorarioToDelete?.valor.toFixed(2)}?`}
        onConfirm={handleExcluirHonorario}
        onClose={() => setIsConfirmationOpen(false)}
      />
    </div>
  );
};

export default GestaoHonorarios;