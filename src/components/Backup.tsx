import React, { useState, useEffect } from 'react';
import { FaDatabase, FaUndo, FaCheckCircle, FaExclamationTriangle, FaDownload, FaUpload, FaHistory, FaClock, FaTrash } from 'react-icons/fa';
import { useData } from '../contexts/DataContext';
import { backupService, BackupHistoryItem } from '../services/backupService';
import './Backup.css'; // Estilos específicos

const Backup: React.FC = () => {
  const { consultas, honorarios, medicos, pacientes, planosSaude } = useData();
  const isProd = process.env.NODE_ENV === 'production';
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('sghm_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupFrequency, setAutoBackupFrequency] = useState(24);

  // Carregar histórico e configurações ao montar componente
  useEffect(() => {
    loadHistory();
    const config = backupService.getAutoBackupConfig();
    setAutoBackupEnabled(config.enabled);
    setAutoBackupFrequency(config.frequency);
  }, []);

  // Timer para backup automático
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const checkInterval = setInterval(() => {
      if (backupService.shouldCreateAutoBackup()) {
        handleAutoBackup();
      }
    }, 60 * 60 * 1000); // Verifica a cada hora

    // Verificar imediatamente ao habilitar
    if (backupService.shouldCreateAutoBackup()) {
      handleAutoBackup();
    }

    return () => clearInterval(checkInterval);
  }, [autoBackupEnabled, consultas, honorarios, medicos, pacientes, planosSaude]);

  const loadHistory = () => {
    const history = backupService.getHistory();
    setBackupHistory(history);
    const last = backupService.getLastBackup();
    setLastBackup(last?.data || null);
  };

  const handleAutoBackup = () => {
    try {
      const backup = backupService.createBackup(
        consultas,
        honorarios,
        medicos,
        pacientes,
        planosSaude,
        'automatico'
      );
      
      backupService.updateLastAutoBackup();
      loadHistory();
      
      console.log('✅ Backup automático criado:', backup.data);
    } catch (error: any) {
      console.error('❌ Erro no backup automático:', error.message);
    }
  };

  const handleBackup = () => {
    setStatus({ type: 'idle', message: 'Criando backup...' });
    setLoading(true);
    
    try {
      // Criar backup real com todos os dados
      const backup = backupService.createBackup(
        consultas,
        honorarios,
        medicos,
        pacientes,
        planosSaude,
        'manual'
      );
      
      setLastBackup(backup.data);
      loadHistory();
      
      setStatus({ 
        type: 'success', 
        message: `Backup criado com sucesso! ${backup.registros} registros salvos (${backup.tamanho})` 
      });
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro ao criar backup: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = () => {
    try {
      setStatus({ type: 'idle', message: 'Exportando backup...' });
      
      backupService.exportBackup(
        consultas,
        honorarios,
        medicos,
        pacientes,
        planosSaude
      );

      setStatus({ type: 'success', message: 'Backup exportado com sucesso! Arquivo baixado.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro ao exportar: ${error.message}` });
    }
  };

  // --- Operações de Backup no Servidor (produção, ADMIN) ---
  const apiBase = process.env.REACT_APP_API_URL || '/api';
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('sghm_token');
    return token ? { Authorization: `Bearer ${token}` } : {} as HeadersInit;
  };

  const handleServerExport = async () => {
    if (!isAdmin) {
      setStatus({ type: 'error', message: 'Ação restrita ao ADMIN.' });
      return;
    }
    setStatus({ type: 'idle', message: 'Exportando backup do servidor...' });
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch(`${apiBase}/backup/export`, {
        method: 'POST',
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha no export do servidor');
      // Baixar payload como arquivo
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-servidor-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'Export do servidor concluído e baixado.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro no export do servidor: ${error.message}` });
    }
  };

  const handleServerImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAdmin) {
      setStatus({ type: 'error', message: 'Ação restrita ao ADMIN.' });
      event.target.value = '';
      return;
    }
    try {
      setStatus({ type: 'idle', message: 'Enviando backup para validação (dry-run)...' });
      const text = await file.text();
      const payload = JSON.parse(text);
      const headers: HeadersInit = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch(`${apiBase}/backup/import`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha no import (dry-run)');
      setStatus({ type: 'success', message: `Import (dry-run) recebido. Tabelas: ${Object.entries(json.data.counts).map(([k,v]) => `${k}:${v}`).join(', ')}` });
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro no import do servidor: ${error.message}` });
    } finally {
      event.target.value = '';
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setStatus({ type: 'idle', message: 'Validando arquivo...' });
        
        const backupData = JSON.parse(e.target?.result as string);
        
        // Validar estrutura
        const validation = backupService.validateBackup(backupData);
        if (!validation.valid) {
          throw new Error(validation.error || 'Formato de backup inválido');
        }

        // Importar backup
        const backup = backupService.importBackup(backupData);
        loadHistory();
        
        setStatus({ 
          type: 'success', 
          message: `Backup importado com sucesso! ${backup.registros} registros (${backup.tamanho}). Use "Restaurar" para aplicar.` 
        });
      } catch (error: any) {
        setStatus({ type: 'error', message: `Erro ao importar: ${error.message}` });
      }
    };
    reader.readAsText(file);
    
    // Limpar input
    event.target.value = '';
  };

  const handleRestore = (backupId?: string) => {
    const last = backupService.getLastBackup();
    if (!last && !backupId) {
      setStatus({ type: 'error', message: 'Nenhum backup encontrado para restaurar.' });
      return;
    }
    
    const targetBackup = backupId 
      ? backupHistory.find(b => b.id === backupId)
      : last;
    
    if (!targetBackup) {
      setStatus({ type: 'error', message: 'Backup não encontrado.' });
      return;
    }
    
    const confirmRestore = window.confirm(
      `⚠️ ATENÇÃO: OPERAÇÃO IRREVERSÍVEL!\n\n` +
      `Tem certeza que deseja restaurar o backup de ${targetBackup.data}?\n\n` +
      `• Todos os dados atuais serão substituídos\n` +
      `• ${targetBackup.registros} registros serão restaurados\n` +
      `• Você precisará fazer logout/login após a restauração\n\n` +
      `Clique OK para confirmar ou Cancelar para abortar.`
    );
    
    if (!confirmRestore) {
      setStatus({ type: 'idle', message: 'Restauração cancelada.' });
      return;
    }
    
    try {
      setStatus({ type: 'idle', message: 'Restaurando dados...' });
      setLoading(true);
      
      const backup = backupService.restoreBackup(targetBackup.id);
      
      if (!backup) {
        throw new Error('Falha ao carregar dados do backup');
      }
      
      setStatus({ 
        type: 'success', 
        message: `✅ Backup restaurado! ${targetBackup.registros} registros recuperados. Recarregando página...` 
      });
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro ao restaurar: ${error.message}` });
      setLoading(false);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    const backup = backupHistory.find(b => b.id === backupId);
    if (!backup) return;
    
    const confirm = window.confirm(
      `Excluir backup de ${backup.data}?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (!confirm) return;
    
    try {
      backupService.deleteBackup(backupId);
      loadHistory();
      setStatus({ type: 'success', message: 'Backup excluído com sucesso.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: `Erro ao excluir: ${error.message}` });
    }
  };

  const handleAutoBackupToggle = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    backupService.saveAutoBackupConfig(enabled, autoBackupFrequency);
    setStatus({ 
      type: 'success', 
      message: enabled 
        ? `Backup automático ativado! Frequência: a cada ${autoBackupFrequency}h`
        : 'Backup automático desativado.' 
    });
  };

  const handleFrequencyChange = (frequency: number) => {
    setAutoBackupFrequency(frequency);
    backupService.saveAutoBackupConfig(autoBackupEnabled, frequency);
    if (autoBackupEnabled) {
      setStatus({ type: 'success', message: `Frequência atualizada para ${frequency}h` });
    }
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

      {/* Configurações de Backup Automático */}
      <div className="backup-card auto-backup-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <FaClock size={20} style={{ color: '#28a745' }} />
          <h3 style={{ margin: 0 }}>Backup Automático</h3>
        </div>
        <p>
          Configure backups automáticos periódicos para proteger seus dados continuamente.
          O sistema criará backups automaticamente no intervalo definido.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => handleAutoBackupToggle(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 500 }}>Habilitar backup automático</span>
            </label>
          </div>
          {autoBackupEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '26px' }}>
              <label style={{ fontWeight: 500 }}>Frequência:</label>
              <select 
                value={autoBackupFrequency} 
                onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #dee2e6',
                  fontSize: '0.9rem'
                }}
              >
                <option value={1}>A cada 1 hora</option>
                <option value={6}>A cada 6 horas</option>
                <option value={12}>A cada 12 horas</option>
                <option value={24}>A cada 24 horas (diário)</option>
                <option value={72}>A cada 3 dias</option>
                <option value={168}>A cada 7 dias (semanal)</option>
              </select>
            </div>
          )}
        </div>
        {autoBackupEnabled && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '6px', fontSize: '0.9rem' }}>
            <strong>✓ Ativo:</strong> Próximo backup automático será criado em até {autoBackupFrequency}h desde o último backup.
          </div>
        )}
      </div>

      {/* Backup Manual */}
      {/* Backup Manual (Local) - ocultar em produção */}
      {!isProd && (
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
          <button className="btn btn-primary btn-backup" onClick={handleBackup} disabled={loading}>
            <FaDatabase /> {loading ? 'Criando...' : 'Fazer Backup Agora'}
          </button>
          <button className="btn btn-secondary btn-backup" onClick={handleExportBackup} disabled={loading}>
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
      )}

      {/* Backup no Servidor (Produção) - apenas ADMIN */}
      {isProd && isAdmin && (
      <div className="backup-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <FaDatabase size={20} style={{ color: '#007bff' }} />
          <h3 style={{ margin: 0 }}>Backup no Servidor</h3>
        </div>
        <p>
          Exporta e valida backups diretamente do servidor (dry-run na importação nesta fase).
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-backup" onClick={handleServerExport} disabled={loading}>
            <FaDownload /> Exportar Backup do Servidor
          </button>
          <label className="btn btn-info btn-backup" style={{ cursor: 'pointer' }}>
            <FaUpload /> Importar Backup (dry-run)
            <input type="file" accept=".json" onChange={handleServerImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      )}

      {/* Importar Backup */}
      {/* Importar Backup Local - ocultar em produção */}
      {!isProd && (
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
      )}

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
        <button className="btn btn-danger btn-backup" onClick={() => handleRestore()} disabled={!lastBackup || loading}>
          <FaUndo /> {loading ? 'Restaurando...' : 'Restaurar Último Backup'}
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
                  <th>Registros</th>
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
                    <td>{backup.registros}</td>
                    <td>{backup.tamanho}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          className="btn-icon-small" 
                          onClick={() => handleRestore(backup.id)}
                          title="Restaurar este backup"
                          disabled={loading}
                        >
                          <FaUndo />
                        </button>
                        <button 
                          className="btn-icon-small btn-delete" 
                          onClick={() => handleDeleteBackup(backup.id)}
                          title="Excluir este backup"
                          disabled={loading}
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
