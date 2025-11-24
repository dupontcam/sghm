import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Honorario } from '../data/mockData';
import { honorariosAPI } from '../services/api';
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
    medicos, planosSaude, refreshHonorarios
  } = useData();

  // Estados do componente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [editingHonorario, setEditingHonorario] = useState<Honorario | null>(null);
  const [honorarioToDelete, setHonorarioToDelete] = useState<Honorario | null>(null);
  
  // Seleção múltipla e ações em lote
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isGlosaModalOpen, setIsGlosaModalOpen] = useState(false);
  const [glosaData, setGlosaData] = useState({ valorGlosa: 0, motivoGlosa: '' });
  
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
        honorario.motivoGlosa?.toLowerCase().includes(filtros.busca.toLowerCase());
      
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
      motivo: honorario.motivoGlosa || ''
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

  // ============= FUNÇÕES DE SELEÇÃO MÚLTIPLA =============
  
  // Selecionar/desselecionar um honorário
  const handleToggleSelecao = (id: number) => {
    setSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Selecionar/desselecionar todos os honorários filtrados
  const handleSelecionarTodos = () => {
    if (selecionados.length === honorariosFiltrados.length) {
      setSelecionados([]);
    } else {
      setSelecionados(honorariosFiltrados.map(h => h.id));
    }
  };

  // Limpar seleção
  const handleLimparSelecao = () => {
    setSelecionados([]);
  };

  // ============= AÇÕES EM LOTE =============
  
  // Marcar selecionados como ENVIADO
  const handleMarcarComoEnviado = async () => {
    if (selecionados.length === 0) {
      alert('Selecione pelo menos um honorário.');
      return;
    }

    const confirmacao = window.confirm(
      `Deseja marcar ${selecionados.length} honorário(s) como ENVIADO?`
    );

    if (confirmacao) {
      try {
        let sucesso = 0;
        let erros = 0;
        
        for (const id of selecionados) {
          const honorario = honorarios.find(h => h.id === id);
          if (honorario && honorario.status === 'PENDENTE') {
            try {
              await honorariosAPI.updateStatus(id, 'ENVIADO');
              sucesso++;
            } catch (err) {
              console.error(`Erro ao atualizar honorário ${id}:`, err);
              erros++;
            }
          }
        }
        
        await refreshHonorarios();
        setSelecionados([]);
        
        if (erros === 0) {
          alert(`${sucesso} honorário(s) marcado(s) como ENVIADO com sucesso!`);
        } else {
          alert(`Atualização parcial: ${sucesso} sucesso(s), ${erros} erro(s).`);
        }
      } catch (error) {
        alert('Erro ao atualizar honorários.');
        console.error(error);
      }
    }
  };

  // Marcar selecionados como PAGO
  const handleMarcarComoPago = async () => {
    if (selecionados.length === 0) {
      alert('Selecione pelo menos um honorário.');
      return;
    }

    const confirmacao = window.confirm(
      `Deseja marcar ${selecionados.length} honorário(s) como PAGO?`
    );

    if (confirmacao) {
      try {
        let sucesso = 0;
        let erros = 0;
        
        for (const id of selecionados) {
          const honorario = honorarios.find(h => h.id === id);
          if (honorario && honorario.status !== 'PAGO') {
            try {
              await honorariosAPI.updateStatus(id, 'PAGO');
              sucesso++;
            } catch (err) {
              console.error(`Erro ao atualizar honorário ${id}:`, err);
              erros++;
            }
          }
        }
        
        await refreshHonorarios();
        setSelecionados([]);
        
        if (erros === 0) {
          alert(`${sucesso} honorário(s) marcado(s) como PAGO com sucesso!`);
        } else {
          alert(`Atualização parcial: ${sucesso} sucesso(s), ${erros} erro(s).`);
        }
      } catch (error) {
        alert('Erro ao atualizar honorários.');
        console.error(error);
      }
    }
  };

  // Abrir modal de glosa
  const handleAbrirModalGlosa = (honorario?: Honorario) => {
    if (honorario) {
      setSelecionados([honorario.id]);
    }
    setGlosaData({ valorGlosa: 0, motivoGlosa: '' });
    setIsGlosaModalOpen(true);
  };

  // Registrar glosa
  const handleRegistrarGlosa = async () => {
    if (selecionados.length === 0) {
      alert('Selecione pelo menos um honorário.');
      return;
    }

    if (!glosaData.motivoGlosa.trim()) {
      alert('Por favor, informe o motivo da glosa.');
      return;
    }

    try {
      let sucesso = 0;
      let erros = 0;
      
      for (const id of selecionados) {
        try {
          await honorariosAPI.updateGlosa(id, {
            valor_glosa: glosaData.valorGlosa,
            motivo_glosa: glosaData.motivoGlosa
          });
          sucesso++;
        } catch (err) {
          console.error(`Erro ao registrar glosa no honorário ${id}:`, err);
          erros++;
        }
      }
      
      await refreshHonorarios();
      setSelecionados([]);
      setIsGlosaModalOpen(false);
      setGlosaData({ valorGlosa: 0, motivoGlosa: '' });
      
      if (erros === 0) {
        alert(`Glosa registrada em ${sucesso} honorário(s) com sucesso!`);
      } else {
        alert(`Registro parcial: ${sucesso} sucesso(s), ${erros} erro(s).`);
      }
    } catch (error) {
      alert('Erro ao registrar glosa.');
      console.error(error);
    }
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
            <label htmlFor="filtro-busca">Buscar:</label>
            <div className="search-input">
              <FaSearch />
              <input
                type="text"
                id="filtro-busca"
                name="filtro-busca"
                placeholder="Médico, plano, motivo..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="filtro-medico">Médico:</label>
            <select id="filtro-medico" name="filtro-medico" value={filtros.medico} onChange={(e) => setFiltros({ ...filtros, medico: e.target.value })}>
              <option value="">Todos os médicos</option>
              {medicos.map(medico => (
                <option key={medico.id} value={medico.id}>{medico.nome}</option>
              ))}
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="filtro-plano-saude">Plano de Saúde:</label>
            <select id="filtro-plano-saude" name="filtro-plano-saude" value={filtros.planoSaude} onChange={(e) => setFiltros({ ...filtros, planoSaude: e.target.value })}>
              <option value="">Todos os planos</option>
              {planosSaude.map(plano => (
                <option key={plano.id} value={plano.id}>{plano.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="filtro-status">Status:</label>
            <select id="filtro-status" name="filtro-status" value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
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
            <label htmlFor="filtro-data-inicio">Data Início:</label>
            <input
              type="date"
              id="filtro-data-inicio"
              name="filtro-data-inicio"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>
          
          <div className="filtro-grupo">
            <label htmlFor="filtro-data-fim">Data Fim:</label>
            <input
              type="date"
              id="filtro-data-fim"
              name="filtro-data-fim"
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

      {/* Barra de Ações em Lote */}
      {selecionados.length > 0 && (
        <div className="acoes-lote-bar">
          <div className="acoes-lote-info">
            <span>{selecionados.length} honorário(s) selecionado(s)</span>
            <button className="btn-link" onClick={handleLimparSelecao}>
              Limpar seleção
            </button>
          </div>
          <div className="acoes-lote-buttons">
            <button className="btn-enviado" onClick={handleMarcarComoEnviado}>
              <FaPaperPlane /> Marcar como Enviado
            </button>
            <button className="btn-pago" onClick={handleMarcarComoPago}>
              <FaCheck /> Marcar como Pago
            </button>
            <button className="btn-glosa" onClick={() => handleAbrirModalGlosa()}>
              <FaTimes /> Registrar Glosa
            </button>
          </div>
        </div>
      )}

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
                <th className="checkbox-cell">
                  <input
                    type="checkbox"
                    id="checkbox-select-all"
                    name="checkbox-select-all"
                    checked={selecionados.length === honorariosFiltrados.length && honorariosFiltrados.length > 0}
                    onChange={handleSelecionarTodos}
                    title="Selecionar todos"
                  />
                </th>
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
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      id={`checkbox-honorario-${honorario.id}`}
                      name={`checkbox-honorario-${honorario.id}`}
                      checked={selecionados.includes(honorario.id)}
                      onChange={() => handleToggleSelecao(honorario.id)}
                    />
                  </td>
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
                  <td>{honorario.motivoGlosa || '-'}</td>
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
          <label htmlFor="form-medico">Médico *:</label>
          <select
            id="form-medico"
            name="form-medico"
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
          <label htmlFor="form-plano-saude">Plano de Saúde *:</label>
          <select
            id="form-plano-saude"
            name="form-plano-saude"
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
            <label htmlFor="form-data-consulta">Data da Consulta *:</label>
            <input
              type="date"
              id="form-data-consulta"
              name="form-data-consulta"
              value={formData.dataConsulta}
              onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="form-valor">Valor *:</label>
            <input
              type="number"
              id="form-valor"
              name="form-valor"
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
          <label htmlFor="form-status">Status:</label>
          <select
            id="form-status"
            name="form-status"
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
            <label htmlFor="form-motivo-glosa">Motivo da Glosa:</label>
            <textarea
              id="form-motivo-glosa"
              name="form-motivo-glosa"
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

      {/* Modal de Glosa */}
      <Modal
        isOpen={isGlosaModalOpen}
        onClose={() => setIsGlosaModalOpen(false)}
        title="Registrar Glosa"
      >
        <div className="glosa-info">
          <p><strong>{selecionados.length}</strong> honorário(s) selecionado(s)</p>
        </div>

        <div className="form-group">
          <label htmlFor="glosa-valor">Valor da Glosa (R$):</label>
          <input
            type="number"
            id="glosa-valor"
            name="glosa-valor"
            step="0.01"
            min="0"
            value={glosaData.valorGlosa}
            onChange={(e) => setGlosaData({ ...glosaData, valorGlosa: Number(e.target.value) })}
            placeholder="0.00"
          />
          <small>Deixe em branco ou 0 para glosa total</small>
        </div>

        <div className="form-group">
          <label htmlFor="glosa-motivo">Motivo da Glosa *:</label>
          <textarea
            id="glosa-motivo"
            name="glosa-motivo"
            value={glosaData.motivoGlosa}
            onChange={(e) => setGlosaData({ ...glosaData, motivoGlosa: e.target.value })}
            placeholder="Descreva o motivo da glosa..."
            rows={4}
            required
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setIsGlosaModalOpen(false)}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={handleRegistrarGlosa}>
            <FaTimes /> Registrar Glosa
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GestaoHonorarios;