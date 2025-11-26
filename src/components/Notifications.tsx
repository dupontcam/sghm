import React, { useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { FaBell, FaExclamationTriangle, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { notificacoesService } from '../services/notificacoesService';
import './Notifications.css';

const Notifications: React.FC = () => {
  const { honorarios, consultas } = useData();
  const navigate = useNavigate();

  // Atualizar notificações quando dados mudarem
  useEffect(() => {
    notificacoesService.atualizarNotificacoes({ honorarios, consultas });
    notificacoesService.limparAntigas();
  }, [honorarios, consultas]);

  // Obter notificações ativas
  const notifications = useMemo(() => {
    return notificacoesService.getNotificacoesAtivas();
  }, [honorarios, consultas]);

  // Marcar todas como lidas ao visualizar a página
  useEffect(() => {
    // Pequeno delay para não marcar imediatamente
    const timer = setTimeout(() => {
      notificacoesService.marcarTodasComoLidas();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handler para dispensar notificação
  const handleDismiss = (id: string) => {
    notificacoesService.dispensar(id);
    // Forçar re-render
    window.dispatchEvent(new Event('notificacoesUpdated'));
  };

  // Handler para ação
  const handleAction = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  // Função para obter ícone baseado no tipo
  const getIcon = (type: 'warning' | 'danger' | 'info' | 'success') => {
    switch (type) {
      case 'danger':
        return <FaExclamationTriangle />;
      case 'warning':
        return <FaClock />;
      case 'success':
        return <FaCheckCircle />;
      default:
        return <FaBell />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Notificações e Alertas</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            Acompanhe alertas importantes sobre honorários e consultas
          </p>
        </div>
        <div className="notification-badge">
          <FaBell size={20} />
          {notifications.length > 0 && (
            <span className="badge-count">{notifications.length}</span>
          )}
        </div>
      </div>

      {/* Resumo de Alertas */}
      <div className="alerts-summary">
        <div className="alert-summary-card danger">
          <div className="alert-icon">
            <FaExclamationTriangle />
          </div>
          <div className="alert-content">
            <strong>{notifications.filter(n => n.type === 'danger').length}</strong>
            <span>Críticos</span>
          </div>
        </div>
        <div className="alert-summary-card warning">
          <div className="alert-icon">
            <FaClock />
          </div>
          <div className="alert-content">
            <strong>{notifications.filter(n => n.type === 'warning').length}</strong>
            <span>Avisos</span>
          </div>
        </div>
        <div className="alert-summary-card info">
          <div className="alert-icon">
            <FaBell />
          </div>
          <div className="alert-content">
            <strong>{notifications.filter(n => n.type === 'info').length}</strong>
            <span>Informativos</span>
          </div>
        </div>
        <div className="alert-summary-card success">
          <div className="alert-icon">
            <FaCheckCircle />
          </div>
          <div className="alert-content">
            <strong>{notifications.filter(n => n.type === 'success').length}</strong>
            <span>Positivos</span>
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <FaCheckCircle size={48} style={{ color: '#28a745', marginBottom: '15px' }} />
            <h3>Nenhuma notificação pendente</h3>
            <p>Todos os processos estão em dia!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification-card ${notification.type}`}>
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                {notification.date && (
                  <small>{new Date(notification.date).toLocaleString('pt-BR')}</small>
                )}
              </div>
              <div className="notification-actions">
                {notification.actionLink && (
                  <button 
                    onClick={() => handleAction(notification.actionLink)} 
                    className="btn-view"
                  >
                    Ver Detalhes
                  </button>
                )}
                <button 
                  className="btn-dismiss" 
                  title="Dispensar"
                  onClick={() => handleDismiss(notification.id)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dicas e Recomendações */}
      <div className="tips-section">
        <h3>💡 Dicas para Reduzir Alertas</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>📤 Envie Honorários Regularmente</h4>
            <p>Envie honorários pendentes semanalmente para evitar acúmulo e atrasos nos pagamentos.</p>
          </div>
          <div className="tip-card">
            <h4>📋 Revise Documentação</h4>
            <p>Certifique-se de que todas as guias estão com documentação completa antes do envio.</p>
          </div>
          <div className="tip-card">
            <h4>📊 Monitore Taxa de Glosa</h4>
            <p>Analise os motivos de glosa e corrija problemas recorrentes na documentação.</p>
          </div>
          <div className="tip-card">
            <h4>🔄 Acompanhe Status</h4>
            <p>Faça follow-up regular dos honorários enviados junto aos planos de saúde.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
