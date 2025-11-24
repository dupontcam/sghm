import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { FaBell, FaExclamationTriangle, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';
import './Notifications.css';

interface Notification {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  date?: string;
  actionLink?: string;
}

const Notifications: React.FC = () => {
  const { honorarios, consultas, planosSaude } = useData();

  // Gerar notificações com base nos dados
  const notifications = useMemo(() => {
    const alerts: Notification[] = [];

    // 1. Honorários pendentes há mais de 30 dias
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const honorariosPendentesAntigos = honorarios.filter(h => {
      const dataConsulta = new Date(h.dataConsulta);
      return h.status === 'PENDENTE' && dataConsulta < trintaDiasAtras;
    });

    if (honorariosPendentesAntigos.length > 0) {
      alerts.push({
        id: 'honorarios-pendentes-antigos',
        type: 'danger',
        title: 'Honorários Pendentes Críticos',
        message: `${honorariosPendentesAntigos.length} honorário(s) pendente(s) há mais de 30 dias`,
        actionLink: '/honorarios'
      });
    }

    // 2. Honorários enviados há mais de 60 dias
    const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const honorariosEnviadosAntigos = honorarios.filter(h => {
      const dataConsulta = new Date(h.dataConsulta);
      return h.status === 'ENVIADO' && dataConsulta < sessentaDiasAtras;
    });

    if (honorariosEnviadosAntigos.length > 0) {
      alerts.push({
        id: 'honorarios-enviados-antigos',
        type: 'warning',
        title: 'Honorários Enviados sem Retorno',
        message: `${honorariosEnviadosAntigos.length} honorário(s) enviado(s) há mais de 60 dias sem resposta`,
        actionLink: '/honorarios'
      });
    }

    // 3. Taxa de glosa alta
    const totalHonorarios = honorarios.length;
    const honorariosGlosados = honorarios.filter(h => h.status === 'GLOSADO').length;
    const taxaGlosa = totalHonorarios > 0 ? (honorariosGlosados / totalHonorarios) * 100 : 0;

    if (taxaGlosa > 15) {
      alerts.push({
        id: 'taxa-glosa-alta',
        type: 'warning',
        title: 'Taxa de Glosa Elevada',
        message: `Taxa de glosa atual: ${taxaGlosa.toFixed(1)}%. Recomendado: < 15%`,
        actionLink: '/honorarios'
      });
    }

    // 4. Honorários pendentes de envio
    const honorariosPendentes = honorarios.filter(h => h.status === 'PENDENTE').length;
    
    if (honorariosPendentes > 10) {
      alerts.push({
        id: 'honorarios-pendentes',
        type: 'info',
        title: 'Honorários Aguardando Envio',
        message: `${honorariosPendentes} honorário(s) pendente(s) de envio ao plano de saúde`,
        actionLink: '/honorarios'
      });
    }

    // 5. Valor total a receber
    const valorTotalReceber = honorarios
      .filter(h => h.status === 'PENDENTE' || h.status === 'ENVIADO')
      .reduce((sum, h) => sum + (h.valor || 0) - (h.valorGlosa || 0), 0);

    if (valorTotalReceber > 10000) {
      alerts.push({
        id: 'valor-receber',
        type: 'info',
        title: 'Valores a Receber',
        message: `Total a receber: ${valorTotalReceber.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        })}`,
        actionLink: '/financeiro'
      });
    }

    // 6. Consultas sem honorário vinculado
    const consultasConvenio = consultas.filter(c => c.tipoPagamento === 'convenio' && c.planoSaudeId);
    const consultasSemHonorario = consultasConvenio.filter(consulta => {
      return !honorarios.some(h => h.consultaId === consulta.id);
    });

    if (consultasSemHonorario.length > 0) {
      alerts.push({
        id: 'consultas-sem-honorario',
        type: 'warning',
        title: 'Consultas sem Honorário',
        message: `${consultasSemHonorario.length} consulta(s) de convênio sem honorário vinculado`,
        actionLink: '/consultas'
      });
    }

    return alerts;
  }, [honorarios, consultas]);

  // Função para obter ícone baseado no tipo
  const getIcon = (type: Notification['type']) => {
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
                  <a href={notification.actionLink} className="btn-view">
                    Ver Detalhes
                  </a>
                )}
                <button className="btn-dismiss" title="Dispensar">
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
