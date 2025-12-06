/**
 * GESTÃO DE HONORÁRIOS
 * 
 * REGRA DE NEGÓCIO IMPORTANTE:
 * - Honorários podem ser EDITADOS/ATUALIZADOS
 * - Honorários NÃO podem ser DELETADOS
 * - Razão: Preservar histórico completo desde criação até acerto final
 * - Atualizações são primordiais para acompanhar status (PENDENTE → PAGO/GLOSADO)
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Honorario, HonorarioHistorico, gerarDescricaoStatus } from '../data/mockData';
import { honorariosAPI } from '../services/api';
import Modal from './Modal';
import HistoricoModal from './HistoricoModal';
import {
  FaFilter, FaFileAlt, FaHistory,
  FaClock, FaPaperPlane, FaCheck, FaTimes, FaSearch, FaCheckSquare, FaSquare
} from 'react-icons/fa';
import './GestaoHonorarios.css';

const GestaoHonorarios: React.FC = () => {
  const ENABLE_HISTORY = (process.env.REACT_APP_ENABLE_HISTORY === 'true');
  const {
    honorarios, addHonorario, updateHonorario, deleteHonorario,
    medicos, planosSaude, refreshHonorarios
  } = useData();

  // Estados do componente
  // Nota: Edição direta removida - use Registrar Glosa para atualizar honorários

  // Seleção múltipla e ações em lote
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isGlosaModalOpen, setIsGlosaModalOpen] = useState(false);
  const [glosaData, setGlosaData] = useState({ valorGlosa: 0, motivoGlosa: '' });

  // Estados para recurso de glosa
  const [isRecursoModalOpen, setIsRecursoModalOpen] = useState(false);
  const [isStatusRecursoModalOpen, setIsStatusRecursoModalOpen] = useState(false);
  const [isHistoricoModalOpen, setIsHistoricoModalOpen] = useState(false);
  const [honorarioSelecionado, setHonorarioSelecionado] = useState<Honorario | null>(null);
  const [historicoAtual, setHistoricoAtual] = useState<HonorarioHistorico[]>([]);
  const [recursoData, setRecursoData] = useState({ motivoRecurso: '', dataRecurso: '' });
  const [statusRecursoData, setStatusRecursoData] = useState({
    statusRecurso: 'ACEITO_TOTAL' as 'ACEITO_TOTAL' | 'ACEITO_PARCIAL' | 'NEGADO',
    valorRecuperado: 0
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    medico: '',
    planoSaude: '',
    status: 'TODOS',
    dataInicio: '',
    dataFim: '',
    busca: ''
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
  // Nota: Honorários não podem ser editados/excluídos diretamente
  // Use "Registrar Glosa" para atualizar status e motivo de glosa

  // Função para ver histórico
  const handleVerHistorico = async (honorario: Honorario) => {
    setHonorarioSelecionado(honorario);
    setIsHistoricoModalOpen(true);
    
    try {
      // Buscar histórico do backend
      const historico = await honorariosAPI.getHistorico(honorario.id);
      
      // Mapeamento de tipos do backend para o frontend
      const mapearTipoEvento = (tipo: string): HonorarioHistorico['tipo'] => {
        const mapa: Record<string, HonorarioHistorico['tipo']> = {
          'GLOSA_REGISTRADA': 'GLOSA',
          'RECURSO_ENVIADO': 'RECURSO_ENVIADO',
          'RECURSO_RESPONDIDO': 'RECURSO_RESPONDIDO',
          'STATUS_ALTERADO': 'STATUS_ALTERADO',
          'CRIACAO': 'CRIACAO',
          'PAGAMENTO': 'PAGAMENTO'
        };
        return mapa[tipo] || 'STATUS_ALTERADO';
      };
      
      // Transformar formato do backend para o formato do frontend
      const historicoFormatado: HonorarioHistorico[] = historico.map((item: any) => ({
        id: item.id.toString(),
        honorarioId: item.honorario_id,
        tipo: mapearTipoEvento(item.tipo_evento),
        data: item.created_at,
        descricao: item.descricao,
        detalhes: item.dados_adicionais?.detalhes,
        statusAnterior: item.dados_adicionais?.status_anterior,
        statusNovo: item.dados_adicionais?.status_novo,
        valorAnterior: item.dados_adicionais?.valor_anterior,
        valorNovo: item.dados_adicionais?.valor_novo,
        usuario: item.dados_adicionais?.usuario
      }));
      
      setHistoricoAtual(historicoFormatado);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setHistoricoAtual([]);
    }
  };

  // Funções de recurso de glosa
  const handleEnviarRecurso = (honorario: Honorario) => {
    setHonorarioSelecionado(honorario);
    setRecursoData({ motivoRecurso: '', dataRecurso: new Date().toISOString().split('T')[0] });
    setIsRecursoModalOpen(true);
  };

  const handleConfirmarRecurso = async () => {
    if (!honorarioSelecionado || !recursoData.motivoRecurso.trim()) {
      alert('Por favor, preencha o motivo do recurso.');
      return;
    }

    try {
      // Chamar API para enviar recurso
      await honorariosAPI.enviarRecurso(honorarioSelecionado.id, {
        motivo_recurso: recursoData.motivoRecurso,
        data_recurso: recursoData.dataRecurso
      });

      // Atualizar lista de honorários
      await refreshHonorarios();

      setIsRecursoModalOpen(false);
      setRecursoData({ motivoRecurso: '', dataRecurso: '' });
      setHonorarioSelecionado(null);

      alert('Recurso enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar recurso:', error);
      alert('Erro ao enviar recurso. Tente novamente.');
    }

    setIsRecursoModalOpen(false);
    setRecursoData({ motivoRecurso: '', dataRecurso: '' });
    setHonorarioSelecionado(null);
  };

  const handleAtualizarStatusRecurso = (honorario: Honorario) => {
    setHonorarioSelecionado(honorario);
    setStatusRecursoData({
      statusRecurso: 'ACEITO_TOTAL',
      valorRecuperado: honorario.valor
    });
    setIsStatusRecursoModalOpen(true);
  };

  const handleConfirmarStatusRecurso = async () => {
    if (!honorarioSelecionado) return;

    const valorRecuperado = statusRecursoData.statusRecurso === 'ACEITO_PARCIAL' ? statusRecursoData.valorRecuperado :
      statusRecursoData.statusRecurso === 'ACEITO_TOTAL' ? honorarioSelecionado.valor : 0;

    try {
      // Chamar API para atualizar status do recurso
      await honorariosAPI.atualizarStatusRecurso(honorarioSelecionado.id, {
        status_recurso: statusRecursoData.statusRecurso,
        valor_recuperado: valorRecuperado
      });

      // Atualizar lista de honorários
      await refreshHonorarios();

      setIsStatusRecursoModalOpen(false);
      setStatusRecursoData({ statusRecurso: 'ACEITO_TOTAL', valorRecuperado: 0 });
      setHonorarioSelecionado(null);

      alert('Status do recurso atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status do recurso:', error);
      alert('Erro ao atualizar status do recurso. Tente novamente.');
    }

    setIsStatusRecursoModalOpen(false);
    setStatusRecursoData({ statusRecurso: 'ACEITO_TOTAL', valorRecuperado: 0 });
    setHonorarioSelecionado(null);
  };

  // Alterar status do honorário (somente via backend; histórico persistido pelo servidor)
  // Observação: Atualizações diretas locais foram removidas para evitar divergência de histórico

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
          // Atualizar localmente para garantir consistência imediata
          const honorario = honorarios.find(h => h.id === id);
          if (honorario) {
            honorario.valorGlosa = glosaData.valorGlosa;
            honorario.motivoGlosa = glosaData.motivoGlosa;
            honorario.status = 'GLOSADO';
            honorario.updatedAt = new Date().toISOString();
            // Histórico agora é gerado somente pelo backend
          }
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

        <div className="filtros-row-datas">
          <div className="filtro-data">
            <label htmlFor="filtro-data-inicio">Data Início:</label>
            <input
              type="date"
              id="filtro-data-inicio"
              name="filtro-data-inicio"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>

          <div className="filtro-data">
            <label htmlFor="filtro-data-fim">Data Fim:</label>
            <input
              type="date"
              id="filtro-data-fim"
              name="filtro-data-fim"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            />
          </div>

          <button className="btn-secondary btn-limpar" onClick={handleLimparFiltros}>
            <FaFilter /> Limpar Filtros
          </button>
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
                <th>Observações</th>
                <th>Recurso</th>
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
                  <td className="observacoes-cell">
                    <div className="observacoes-content">
                      {gerarDescricaoStatus(honorario) || '-'}
                    </div>
                  </td>
                  <td>
                    {honorario.status === 'GLOSADO' && (
                      <div className="recurso-container">
                        {!honorario.recursoEnviado ? (
                          <button
                            className="btn-icon info"
                            onClick={() => handleEnviarRecurso(honorario)}
                            title="Enviar Recurso"
                          >
                            <FaSquare />
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <FaCheckSquare
                              style={{ color: '#28a745', cursor: 'pointer', fontSize: '1.2rem' }}
                              onClick={() => handleAtualizarStatusRecurso(honorario)}
                              title="Atualizar Status do Recurso"
                            />
                            {honorario.statusRecurso && (
                              <span
                                className={`status-badge status-${honorario.statusRecurso.toLowerCase()}`}
                                style={{ fontSize: '0.7rem', padding: '2px 6px' }}
                              >
                                {honorario.statusRecurso === 'ACEITO_TOTAL' ? 'Aceito' :
                                  honorario.statusRecurso === 'ACEITO_PARCIAL' ? 'Parcial' :
                                    honorario.statusRecurso === 'NEGADO' ? 'Negado' : 'Pendente'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {honorario.status !== 'GLOSADO' && '-'}
                  </td>
                  <td>
                    {ENABLE_HISTORY && (
                      <button
                        className="btn-icon secondary"
                        onClick={() => handleVerHistorico(honorario)}
                        title="Ver Histórico"
                      >
                        <FaHistory />
                      </button>
                    )}
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

      {/* Modal de Enviar Recurso */}
      <Modal
        isOpen={isRecursoModalOpen}
        onClose={() => setIsRecursoModalOpen(false)}
        title="Enviar Recurso de Glosa"
      >
        {honorarioSelecionado && (
          <div className="recurso-info">
            <p><strong>Honorário:</strong> R$ {honorarioSelecionado.valor.toFixed(2)}</p>
            <p><strong>Motivo da Glosa:</strong> {honorarioSelecionado.motivoGlosa}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="recurso-data">Data do Recurso *:</label>
          <input
            type="date"
            id="recurso-data"
            name="recurso-data"
            value={recursoData.dataRecurso}
            onChange={(e) => setRecursoData({ ...recursoData, dataRecurso: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recurso-motivo">Justificativa do Recurso *:</label>
          <textarea
            id="recurso-motivo"
            name="recurso-motivo"
            value={recursoData.motivoRecurso}
            onChange={(e) => setRecursoData({ ...recursoData, motivoRecurso: e.target.value })}
            placeholder="Descreva a justificativa para contestar a glosa..."
            rows={5}
            required
          />
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setIsRecursoModalOpen(false)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleConfirmarRecurso}>
            <FaPaperPlane /> Enviar Recurso
          </button>
        </div>
      </Modal>

      {/* Modal de Atualizar Status do Recurso */}
      <Modal
        isOpen={isStatusRecursoModalOpen}
        onClose={() => setIsStatusRecursoModalOpen(false)}
        title="Atualizar Status do Recurso"
      >
        {honorarioSelecionado && (
          <div className="recurso-info">
            <p><strong>Honorário:</strong> R$ {honorarioSelecionado.valor.toFixed(2)}</p>
            <p><strong>Recurso enviado em:</strong> {honorarioSelecionado.dataRecurso ? new Date(honorarioSelecionado.dataRecurso).toLocaleDateString('pt-BR') : '-'}</p>
            <p><strong>Justificativa:</strong> {honorarioSelecionado.motivoRecurso}</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="status-recurso">Resultado do Recurso *:</label>
          <select
            id="status-recurso"
            name="status-recurso"
            value={statusRecursoData.statusRecurso}
            onChange={(e) => setStatusRecursoData({
              ...statusRecursoData,
              statusRecurso: e.target.value as 'ACEITO_TOTAL' | 'ACEITO_PARCIAL' | 'NEGADO'
            })}
          >
            <option value="ACEITO_TOTAL">Aceito Totalmente</option>
            <option value="ACEITO_PARCIAL">Aceito Parcialmente</option>
            <option value="NEGADO">Negado</option>
          </select>
        </div>

        {statusRecursoData.statusRecurso === 'ACEITO_PARCIAL' && (
          <div className="form-group">
            <label htmlFor="valor-recuperado">Valor Recuperado (R$) *:</label>
            <input
              type="number"
              id="valor-recuperado"
              name="valor-recuperado"
              step="0.01"
              min="0"
              max={honorarioSelecionado?.valor || 0}
              value={statusRecursoData.valorRecuperado}
              onChange={(e) => setStatusRecursoData({
                ...statusRecursoData,
                valorRecuperado: Number(e.target.value)
              })}
              placeholder="0.00"
              required
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setIsStatusRecursoModalOpen(false)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleConfirmarStatusRecurso}>
            <FaCheck /> Confirmar
          </button>
        </div>
      </Modal>

      {/* Modal de Histórico */}
      {ENABLE_HISTORY && (
        <HistoricoModal
          isOpen={isHistoricoModalOpen}
          onClose={() => {
            setIsHistoricoModalOpen(false);
            setHonorarioSelecionado(null);
            setHistoricoAtual([]);
          }}
          historico={historicoAtual}
          numeroGuia={honorarioSelecionado?.numeroGuia}
        />
      )}
    </div>
  );
};

export default GestaoHonorarios;