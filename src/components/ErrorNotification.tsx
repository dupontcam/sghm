import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import './ErrorNotification.css';

/**
 * ErrorNotification - Exibe notificações de erro do DataContext
 * Fica no topo da tela e desaparece automaticamente
 */
const ErrorNotification: React.FC = () => {
  const { error, clearError } = useData();

  useEffect(() => {
    if (error) {
      // Auto-dismiss após 5 segundos
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="error-notification">
      <div className="error-notification-content">
        <div className="error-notification-icon">⚠️</div>
        <div className="error-notification-message">
          <strong>Erro:</strong> {error}
        </div>
        <button 
          className="error-notification-close"
          onClick={clearError}
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;
