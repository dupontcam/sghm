import React, { useState } from 'react';
import { FaDatabase, FaUndo, FaCheckCircle, FaExclamationTriangle, FaDownload, FaUpload, FaHistory, FaClock } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';
import './Backup.css'; // Estilos específicos

interface BackupHistory {
  id: number;
  data: string;
  tipo: 'manual' | 'automatico';
  tamanho: string;
}

const Backup: React.FC = () => {
  const { consultas, honorarios, medicos, pacientes, planosSaude } = useData();
  const [lastBackup, setLastBackup] = useState<string | null>('22/10/2025 09:30:00');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    { id: 1, data: '22/10/2025 09:30:00', tipo: 'manual', tamanho: '2.4 MB' },
    { id: 2, data: '21/10/2025 09:30:00', tipo: 'automatico', tamanho: '2.3 MB' },
    { id: 3, data: '20/10/2025 09:30:00', tipo: 'automatico', tamanho: '2.2 MB' },
  ]);

  const handleBackup = () => {
    setStatus({ type: 'idle', message: 'Iniciando backup...' });
    
    // Simula uma operação de backup que leva 2 segundos
    setTimeout(() => {
      const now = new Date().toLocaleString('pt-BR');
      setLastBackup(now);
      
      // Adiciona ao histórico
      const newBackup: BackupHistory = {
        id: backupHistory.length + 1,
        data: now,
        tipo: 'manual',
        tamanho: `${(Math.random() * 2 + 1).toFixed(1)} MB`
      };
      setBackupHistory([newBackup, ...backupHistory]);
      
      setStatus({ type: 'success', message: `Backup concluído com sucesso em ${now}` });
    }, 2000);
  };

  const handleExportBackup = () => {
    // Criar objeto com todos os dados
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        consultas,
        honorarios,
        medicos,
        pacientes,
        planosSaude
      }
    };

    // Converter para JSON
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Criar link de download
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-sghm-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatus({ type: 'success', message: 'Backup exportado com sucesso!' });
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Validar estrutura
        if (!backupData.data || !backupData.version) {
          throw new Error('Formato de backup inválido');
        }

        setStatus({ type: 'idle', message: 'Importando backup...' });
        
        // Simula importação
        setTimeout(() => {
          setStatus({ 
            type: 'success', 
            message: `Backup importado com sucesso! ${Object.keys(backupData.data).length} tabelas restauradas.` 
          });
        }, 2000);
      } catch (error) {
        setStatus({ type: 'error', message: 'Erro ao importar backup. Arquivo inválido.' });
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!lastBackup) {
      setStatus({ type: 'error', message: 'Nenhum backup encontrado para restaurar.' });
      return;
    }
    
    const confirmRestore = window.confirm(
      `Tem certeza que deseja restaurar o backup de ${lastBackup}?\n\nTodos os dados atuais serão substituídos!`
    );
    
    if (!confirmRestore) return;
    
    setStatus({ type: 'idle', message: 'Restaurando backup...' });
    
    // Simula uma operação de restauração
    setTimeout(() => {
      setStatus({ type: 'success', message: `Sistema restaurado com sucesso a partir do backup de ${lastBackup}` });
    }, 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Backup e Restauração</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            Gerencie backups e restaurações do sistema de forma segura
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="backup-stats">
        <div className="backup-stat-card">
          <FaDatabase size={24} style={{ color: '#007bff' }} />
          <div>
            <strong>{consultas.length + honorarios.length}</strong>
            <span>Registros Totais</span>
          </div>
        </div>
        <div className="backup-stat-card">
          <FaClock size={24} style={{ color: '#28a745' }} />
          <div>
            <strong>{lastBackup ? lastBackup.split(' ')[0] : 'N/A'}</strong>
            <span>Último Backup</span>
          </div>
        </div>
        <div className="backup-stat-card">
          <FaHistory size={24} style={{ color: '#17a2b8' }} />
          <div>
            <strong>{backupHistory.length}</strong>
            <span>Backups Salvos</span>
          </div>
        </div>
      </div>

      {/* Backup Manual */}
      <div className="backup-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <FaDatabase size={20} style={{ color: '#007bff' }} />
          <h3 style={{ margin: 0 }}>Backup Manual</h3>
        </div>
        <p>
          Crie um ponto de restauração seguro para todos os dados do sistema. 
          Recomenda-se fazer backups diários ou antes de operações importantes.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-backup" onClick={handleBackup}>
            <FaDatabase /> Fazer Backup Agora
          </button>
          <button className="btn btn-secondary btn-backup" onClick={handleExportBackup}>
            <FaDownload /> Exportar Backup (JSON)
          </button>
        </div>
        {lastBackup && (
          <div className="last-backup-info">
            <FaClock style={{ marginRight: '5px' }} />
            Último backup: <strong>{lastBackup}</strong>
          </div>
        )}
      </div>

      {/* Importar Backup */}
      <div className="backup-card import-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <FaUpload size={20} style={{ color: '#17a2b8' }} />
          <h3 style={{ margin: 0 }}>Importar Backup</h3>
        </div>
        <p>
          Restaure dados a partir de um arquivo de backup exportado anteriormente.
          Selecione um arquivo JSON válido.
        </p>
        <label htmlFor="import-backup" className="btn btn-info btn-backup" style={{ cursor: 'pointer' }}>
          <FaUpload /> Selecionar Arquivo de Backup
          <input
            id="import-backup"
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Restauração do Sistema */}
      <div className="backup-card restore-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <FaUndo size={20} style={{ color: '#dc3545' }} />
          <h3 style={{ margin: 0 }}>Restauração do Sistema</h3>
        </div>
        <p>
          Restaure o sistema a partir do último ponto de backup interno. 
          <strong style={{ color: '#dc3545' }}> ⚠️ Atenção:</strong> Todos os dados não salvos desde o último backup serão perdidos.
        </p>
        <button className="btn btn-danger btn-backup" onClick={handleRestore} disabled={!lastBackup}>
          <FaUndo /> Restaurar Último Backup
        </button>
      </div>

      {/* Histórico de Backups */}
      <div className="backup-card history-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <FaHistory size={20} style={{ color: '#6c757d' }} />
          <h3 style={{ margin: 0 }}>Histórico de Backups</h3>
        </div>
        <div className="backup-history">
          {backupHistory.length > 0 ? (
            <table className="backup-table">
              <thead>
                <tr>
                  <th>Data e Hora</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((backup) => (
                  <tr key={backup.id}>
                    <td>{backup.data}</td>
                    <td>
                      <span className={`badge-type badge-${backup.tipo}`}>
                        {backup.tipo === 'manual' ? 'Manual' : 'Automático'}
                      </span>
                    </td>
                    <td>{backup.tamanho}</td>
                    <td>
                      <button 
                        className="btn-icon-small" 
                        onClick={() => {
                          if (window.confirm(`Restaurar backup de ${backup.data}?`)) {
                            setStatus({ type: 'success', message: `Backup de ${backup.data} restaurado!` });
                          }
                        }}
                        title="Restaurar este backup"
                      >
                        <FaUndo />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
              Nenhum backup no histórico
            </p>
          )}
        </div>
      </div>

      {/* Área de Status/Feedback */}
      {status.message && (
        <div className={`backup-status status-${status.type}`}>
          {status.type === 'success' && <FaCheckCircle />}
          {status.type === 'error' && <FaExclamationTriangle />}
          {status.type === 'idle' && <FaClock />}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default Backup;
