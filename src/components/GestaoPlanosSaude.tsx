import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PlanoSaude } from '../data/mockData';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
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

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'PRIVADO' as PlanoSaude['tipo'],
    ativo: true
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
    setFormData({ nome: '', tipo: 'PRIVADO', ativo: true });
    setIsModalOpen(true);
  };

  // Abrir modal para editar plano
  const handleEditarPlano = (plano: PlanoSaude) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      tipo: plano.tipo,
      ativo: plano.ativo
    });
    setIsModalOpen(true);
  };

  // Salvar plano (criar ou editar)
  const handleSalvarPlano = () => {
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome do plano.');
      return;
    }

    if (editingPlano) {
      // Editar plano existente
      const planoAtualizado: PlanoSaude = {
        ...editingPlano,
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        ativo: formData.ativo,
        updatedAt: new Date().toISOString()
      };
      updatePlanoSaude(planoAtualizado);
    } else {
      // Criar novo plano
      addPlanoSaude({
        nome: formData.nome.trim(),
        tipo: formData.tipo,
        ativo: formData.ativo
      });
    }

    setIsModalOpen(false);
    setFormData({ nome: '', tipo: 'PRIVADO', ativo: true });
  };

  // Confirmar exclusão
  const handleConfirmarExclusao = (plano: PlanoSaude) => {
    setPlanoToDelete(plano);
    setIsConfirmationOpen(true);
  };

  // Executar exclusão
  const handleExcluirPlano = () => {
    if (planoToDelete) {
      const sucesso = deletePlanoSaude(planoToDelete.id);
      if (!sucesso) {
        alert('Não é possível excluir este plano pois existem honorários associados.');
      }
      setIsConfirmationOpen(false);
      setPlanoToDelete(null);
    }
  };

  // Toggle status ativo
  const handleToggleStatus = (plano: PlanoSaude) => {
    const planoAtualizado: PlanoSaude = {
      ...plano,
      ativo: !plano.ativo,
      updatedAt: new Date().toISOString()
    };
    updatePlanoSaude(planoAtualizado);
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
            <option value="PUBLICO">Público</option>
            <option value="PRIVADO">Privado</option>
            <option value="COOPERATIVA">Cooperativa</option>
            <option value="SEGURADORA">Seguradora</option>
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
          <label>Nome do Plano:</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Unimed DF, Bradesco Saúde..."
          />
        </div>

        <div className="form-group">
          <label>Tipo:</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as PlanoSaude['tipo'] })}
          >
            <option value="PUBLICO">Público</option>
            <option value="PRIVADO">Privado</option>
            <option value="COOPERATIVA">Cooperativa</option>
            <option value="SEGURADORA">Seguradora</option>
          </select>
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
    </div>
  );
};

export default GestaoPlanosSaude;