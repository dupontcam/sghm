import React, { useState } from 'react';
import { FaDatabase, FaUndo, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Backup.css'; // Estilos específicos

const Backup: React.FC = () => {
  const [lastBackup, setLastBackup] = useState<string | null>('22/10/2025 09:30:00');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

  const handleBackup = () => {
    setStatus({ type: 'idle', message: 'Iniciando backup...' });
    
    // Simula uma operação de backup que leva 2 segundos
    setTimeout(() => {
      const now = new Date().toLocaleString('pt-BR');
      setLastBackup(now);
      setStatus({ type: 'success', message: `Backup concluído com sucesso em ${now}` });
    }, 2000);
  };

  const handleRestore = () => {
    if (!lastBackup) {
      setStatus({ type: 'error', message: 'Nenhum backup encontrado para restaurar.' });
      return;
    }
    
    setStatus({ type: 'idle', message: 'Restaurando backup...' });
    
    // Simula uma operação de restauração
    setTimeout(() => {
      setStatus({ type: 'success', message: `Sistema restaurado com sucesso a partir do backup de ${lastBackup}` });
    }, 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Backup e Restauração</h1>
      </div>

      <div className="backup-card">
        <h3>Backup dos Dados</h3>
        <p>
          Crie um ponto de restauração seguro para todos os dados do sistema. 
          Recomenda-se fazer backups diários.
        </p>
        <button className="btn btn-primary btn-backup" onClick={handleBackup}>
          <FaDatabase /> Fazer Backup Agora
        </button>
        {lastBackup && (
          <p className="last-backup-info">
            Último backup realizado em: <strong>{lastBackup}</strong>
          </p>
        )}
      </div>

      <div className="backup-card restore-card">
        <h3>Restauração do Sistema</h3>
        <p>
          Restaure o sistema a partir do último ponto de backup. 
          <strong style={{ color: '#dc3545' }}>Atenção:</strong> Todos os dados não salvos desde o último backup serão perdidos.
        </p>
        <button className="btn btn-danger btn-backup" onClick={handleRestore} disabled={!lastBackup}>
          <FaUndo /> Restaurar Último Backup
        </button>
      </div>

      {/* Área de Status/Feedback */}
      {status.message && (
        <div className={`backup-status status-${status.type}`}>
          {status.type === 'success' && <FaCheckCircle />}
          {status.type === 'error' && <FaExclamationTriangle />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default Backup;
