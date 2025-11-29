import React from 'react';
import { HonorarioHistorico } from '../data/mockData';
import { FaTimes, FaHistory } from 'react-icons/fa';
import './Modal.css';
import './HistoricoModal.css';

interface HistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  historico: HonorarioHistorico[];
  numeroGuia?: string;
}

const HistoricoModal: React.FC<HistoricoModalProps> = ({ isOpen, onClose, historico, numeroGuia }) => {
  if (!isOpen) return null;

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIconeETipo = (tipo: HonorarioHistorico['tipo']) => {
    const mapaTipos = {
      'CRIACAO': { icone: '📝', label: 'Criação', cor: '#4CAF50' },
      'STATUS_ALTERADO': { icone: '🔄', label: 'Status Alterado', cor: '#2196F3' },
      'GLOSA': { icone: '⚠️', label: 'Glosa', cor: '#FF9800' },
      'RECURSO_ENVIADO': { icone: '📤', label: 'Recurso Enviado', cor: '#9C27B0' },
      'RECURSO_RESPONDIDO': { icone: '📥', label: 'Recurso Respondido', cor: '#673AB7' },
      'PAGAMENTO': { icone: '✅', label: 'Pagamento', cor: '#4CAF50' }
    };
    return mapaTipos[tipo] || { icone: '📄', label: tipo, cor: '#757575' };
  };

  // Ordenar por data (mais recente primeiro)
  const historicoOrdenado = [...historico].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-historico" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaHistory /> Histórico da Cobrança
            {numeroGuia && <span className="numero-guia"> - Guia: {numeroGuia}</span>}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {historicoOrdenado.length === 0 ? (
            <div className="historico-vazio">
              <FaHistory size={48} color="#ccc" />
              <p>Nenhum registro de histórico encontrado.</p>
            </div>
          ) : (
            <div className="timeline">
              {historicoOrdenado.map((registro, index) => {
                const { icone, label, cor } = getIconeETipo(registro.tipo);
                
                return (
                  <div key={registro.id} className="timeline-item">
                    <div className="timeline-marker" style={{ backgroundColor: cor }}>
                      {icone}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-tipo" style={{ color: cor }}>{label}</span>
                        <span className="timeline-data">{formatarData(registro.data)}</span>
                      </div>
                      <div className="timeline-descricao">
                        {registro.descricao}
                      </div>
                      {registro.detalhes && (
                        <div className="timeline-detalhes">
                          {registro.detalhes}
                        </div>
                      )}
                      {(registro.statusAnterior || registro.statusNovo) && (
                        <div className="timeline-status-change">
                          {registro.statusAnterior && (
                            <span className="status-anterior">
                              De: <strong>{registro.statusAnterior}</strong>
                            </span>
                          )}
                          {registro.statusNovo && (
                            <span className="status-novo">
                              Para: <strong>{registro.statusNovo}</strong>
                            </span>
                          )}
                        </div>
                      )}
                      {(registro.valorAnterior !== undefined || registro.valorNovo !== undefined) && (
                        <div className="timeline-valor-change">
                          {registro.valorAnterior !== undefined && (
                            <span>
                              Valor anterior: <strong>R$ {registro.valorAnterior.toFixed(2)}</strong>
                            </span>
                          )}
                          {registro.valorNovo !== undefined && (
                            <span>
                              Valor novo: <strong>R$ {registro.valorNovo.toFixed(2)}</strong>
                            </span>
                          )}
                        </div>
                      )}
                      {registro.usuario && (
                        <div className="timeline-usuario">
                          por {registro.usuario}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoricoModal;
