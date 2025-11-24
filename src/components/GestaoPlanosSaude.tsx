import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PlanoSaude } from '../data/mockData';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import FeedbackModal from './FeedbackModal';
import { FaPlus, FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './GestaoPlanosSaude.css';

const GestaoPlanosSaude: React.FC = () => {
  const { 
    planosSaude, addPlanoSaude, updatePlanoSaude, deletePlanoSaude, 
    getHonorariosByPlano 
  } = useData();

  // Estados do componente
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoSaude | null>(null);
  const [planoToDelete, setPlanoToDelete] = useState<PlanoSaude | null>(null);
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('TODOS');
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; tipo: 'success' | 'error'; mensagem: string }>({
    isOpen: false,
    tipo: 'success',
    mensagem: ''
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'PARTICULAR' as PlanoSaude['tipo'],
    ativo: true,
    codigoOperadora: '',
    valorConsultaPadrao: 100,
    prazoPagamentoDias: 30,
    percentualGlosa: 5
  });

  // Filtrar planos
  const planosFiltrados = planosSaude.filter(plano => {
    const matchNome = plano.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchTipo = tipoFiltro === 'TODOS' || plano.tipo === tipoFiltro;
    return matchNome && matchTipo;
  });

  // Abrir modal para criar novo plano
  const handleNovoPlano = () => {
    setEditingPlano(null);
    setFormData({ 
      nome: '', 
      tipo: 'PARTICULAR', 
      ativo: true,
      codigoOperadora: '',
      valorConsultaPadrao: 100,
      prazoPagamentoDias: 30,
      percentualGlosa: 5
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar plano
  const handleEditarPlano = (plano: PlanoSaude) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      tipo: plano.tipo,
      ativo: plano.ativo,
      codigoOperadora: (plano as any).codigoOperadora || '',
      valorConsultaPadrao: (plano as any).valorConsultaPadrao || 100,
      prazoPagamentoDias: (plano as any).prazoPagamentoDias || 30,
      percentualGlosa: (plano as any).percentualGlosa || 5
    });
    setIsModalOpen(true);
  };

  // Salvar plano (criar ou editar)
  const handleSalvarPlano = async () => {
    if (!formData.nome.trim()) {
      setFeedbackModal({
        isOpen: true,
        tipo: 'error',
        mensagem: 'Por favor, preencha o nome do plano.'
      });
      return;
    }

    if (formData.valorConsultaPadrao <= 0) {
      setFeedbackModal({
        isOpen: true,
        tipo: 'error',
        mensagem: 'O valor da consulta padrão deve ser maior que zero.'
      });
      return;
    }

    const planoData = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      ativo: formData.ativo,
      codigoOperadora: formData.codigoOperadora.trim() || null,
      valorConsultaPadrao: formData.valorConsultaPadrao,
      prazoPagamentoDias: formData.prazoPagamentoDias,
      percentualGlosa: formData.percentualGlosa
    };

    try {
      if (editingPlano) {
        // Editar plano existente
        const planoAtualizado = {
          ...editingPlano,
          ...planoData,
          updatedAt: new Date().toISOString()
        };
        await updatePlanoSaude(planoAtualizado);
        
        setIsModalOpen(false);
        setFormData({ 
          nome: '', 
          tipo: 'PARTICULAR', 
          ativo: true,
          codigoOperadora: '',
          valorConsultaPadrao: 100,
          prazoPagamentoDias: 30,
          percentualGlosa: 5
        });
        
        setFeedbackModal({
          isOpen: true,
          tipo: 'success',
          mensagem: 'Plano de saúde atualizado com sucesso!'
        });
      } else {
        // Criar novo plano
        await addPlanoSaude(planoData);
        
        setIsModalOpen(false);
        setFormData({ 
          nome: '', 
          tipo: 'PARTICULAR', 
          ativo: true,
          codigoOperadora: '',
          valorConsultaPadrao: 100,
          prazoPagamentoDias: 30,
          percentualGlosa: 5
        });
        
        setFeedbackModal({
          isOpen: true,
          tipo: 'success',
          mensagem: 'Plano de saúde criado com sucesso!'
        });
      }
    } catch (error: any) {
      console.error('Erro capturado ao salvar plano:', error);
      
      // Fechar o modal de formulário
      setIsModalOpen(false);
      
      // Tratamento específico para erros de duplicidade
      let mensagemErro = error.message || 'Erro ao salvar plano de saúde.';
      
      if (mensagemErro.includes('já existe') || mensagemErro.includes('duplicado') || 
          mensagemErro.toLowerCase().includes('already exists')) {
        mensagemErro = `Já existe um plano cadastrado com o nome "${formData.nome}" ou código de operadora "${formData.codigoOperadora}".\n\nPor favor, verifique os dados e tente novamente com valores diferentes.`;
      }

      setFeedbackModal({
        isOpen: true,
        tipo: 'error',
        mensagem: mensagemErro
      });
      
      console.log('FeedbackModal definido:', { isOpen: true, tipo: 'error', mensagem: mensagemErro });
    }
  };

  // Confirmar exclusão
  const handleConfirmarExclusao = (plano: PlanoSaude) => {
    setPlanoToDelete(plano);
    setIsConfirmationOpen(true);
  };

  // Executar exclusão
  const handleExcluirPlano = async () => {
    if (planoToDelete) {
      try {
        const sucesso = await deletePlanoSaude(planoToDelete.id);
        
        setIsConfirmationOpen(false);
        setPlanoToDelete(null);
        
        if (sucesso) {
          setFeedbackModal({
            isOpen: true,
            tipo: 'success',
            mensagem: `Plano "${planoToDelete.nome}" excluído com sucesso!`
          });
        } else {
          setFeedbackModal({
            isOpen: true,
            tipo: 'error',
            mensagem: 'Não é possível excluir este plano pois existem honorários associados.'
          });
        }
      } catch (error: any) {
        setIsConfirmationOpen(false);
        setPlanoToDelete(null);
        
        setFeedbackModal({
          isOpen: true,
          tipo: 'error',
          mensagem: error.message || 'Erro ao excluir plano de saúde.'
        });
      }
    }
  };

  // Toggle status ativo
  const handleToggleStatus = async (plano: PlanoSaude) => {
    try {
      const planoAtualizado: PlanoSaude = {
        ...plano,
        ativo: !plano.ativo,
        updatedAt: new Date().toISOString()
      };
      await updatePlanoSaude(planoAtualizado);
      
      setFeedbackModal({
        isOpen: true,
        tipo: 'success',
        mensagem: `Plano "${plano.nome}" ${planoAtualizado.ativo ? 'ativado' : 'desativado'} com sucesso!`
      });
    } catch (error: any) {
      setFeedbackModal({
        isOpen: true,
        tipo: 'error',
        mensagem: error.message || 'Erro ao alterar status do plano.'
      });
    }
  };

  // Estatísticas do plano
  const getEstatisticasPlano = (plano: PlanoSaude) => {
    const honorarios = getHonorariosByPlano(plano.id);
    const totalHonorarios = honorarios.reduce((acc, h) => acc + h.valor, 0);
    const quantidadeHonorarios = honorarios.length;
    
    return { totalHonorarios, quantidadeHonorarios };
  };

  return (
    <div className="gestao-planos-container">
      <div className="page-header">
        <h1>Gestão de Planos de Saúde</h1>
        <button className="btn-primary" onClick={handleNovoPlano}>
          <FaPlus /> Novo Plano
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-grupo">
          <label>Buscar por nome:</label>
          <input
            type="text"
            placeholder="Digite o nome do plano..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="filtro-grupo">
          <label>Filtrar por tipo:</label>
          <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="TODOS">Todos os tipos</option>
            <option value="PARTICULAR">Particular</option>
            <option value="CONVENIO">Convênio</option>
          </select>
        </div>
      </div>

      {/* Lista de Planos */}
      <div className="planos-grid">
        {planosFiltrados.map(plano => {
          const stats = getEstatisticasPlano(plano);
          return (
            <div key={plano.id} className={`plano-card ${!plano.ativo ? 'inativo' : ''}`}>
              <div className="plano-header">
                <h3>{plano.nome}</h3>
                <div className="plano-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleToggleStatus(plano)}
                    title={plano.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {plano.ativo ? <FaToggleOn className="ativo" /> : <FaToggleOff className="inativo" />}
                  </button>
                  <button 
                    className="btn-icon edit"
                    onClick={() => handleEditarPlano(plano)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-icon delete"
                    onClick={() => handleConfirmarExclusao(plano)}
                    title="Excluir"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="plano-info">
                <div className="info-row">
                  <span className="label">Tipo:</span>
                  <span className={`badge badge-${plano.tipo.toLowerCase()}`}>
                    {plano.tipo}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status ${plano.ativo ? 'ativo' : 'inativo'}`}>
                    {plano.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="plano-stats">
                <div className="stat">
                  <span className="stat-value">R$ {stats.totalHonorarios.toFixed(2)}</span>
                  <span className="stat-label">Total Honorários</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{stats.quantidadeHonorarios}</span>
                  <span className="stat-label">Quantidade</span>
                </div>
              </div>

              <div className="plano-footer">
                <small>Atualizado: {new Date(plano.updatedAt).toLocaleDateString('pt-BR')}</small>
              </div>
            </div>
          );
        })}
      </div>

      {planosFiltrados.length === 0 && (
        <div className="empty-state">
          <FaEye />
          <p>Nenhum plano de saúde encontrado com os filtros aplicados.</p>
        </div>
      )}

      {/* Modal de Formulário */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingPlano ? 'Editar Plano de Saúde' : 'Novo Plano de Saúde'}
      >
        <div className="form-group">
          <label>Nome do Plano: *</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Unimed DF, Bradesco Saúde..."
            required
          />
        </div>

        <div className="form-group">
          <label>Código da Operadora:</label>
          <input
            type="text"
            value={formData.codigoOperadora}
            onChange={(e) => setFormData({ ...formData, codigoOperadora: e.target.value })}
            placeholder="Ex: 123456"
          />
        </div>

        <div className="form-group">
          <label>Tipo:</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as PlanoSaude['tipo'] })}
          >
            <option value="PARTICULAR">Particular</option>
            <option value="CONVENIO">Convênio</option>
          </select>
        </div>

        <div className="form-group">
          <label>Valor Consulta Padrão (R$): *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.valorConsultaPadrao}
            onChange={(e) => setFormData({ ...formData, valorConsultaPadrao: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="form-group">
          <label>Prazo Pagamento (dias):</label>
          <input
            type="number"
            min="1"
            value={formData.prazoPagamentoDias}
            onChange={(e) => setFormData({ ...formData, prazoPagamentoDias: parseInt(e.target.value) || 30 })}
          />
        </div>

        <div className="form-group">
          <label>Percentual Glosa Histórica (%):</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.percentualGlosa}
            onChange={(e) => setFormData({ ...formData, percentualGlosa: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            />
            Plano ativo
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSalvarPlano}>
            {editingPlano ? 'Atualizar' : 'Criar'} Plano
          </button>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o plano "${planoToDelete?.nome}"?`}
        onConfirm={handleExcluirPlano}
        onClose={() => setIsConfirmationOpen(false)}
      />

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        tipo={feedbackModal.tipo}
        mensagem={feedbackModal.mensagem}
        onClose={() => setFeedbackModal({ isOpen: false, tipo: 'success', mensagem: '' })}
      />
    </div>
  );
};

export default GestaoPlanosSaude;