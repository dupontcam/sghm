import { Consulta, Honorario, Medico, Paciente, PlanoSaude } from '../data/mockData';
import { usuariosService } from './usuariosService';

const BACKUP_HISTORY_KEY = 'sghm_backup_history';
const BACKUP_PREFIX = 'sghm_backup_';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    consultas: Consulta[];
    honorarios: Honorario[];
    medicos: Medico[];
    pacientes: Paciente[];
    planosSaude: PlanoSaude[];
    usuarios: any[];
  };
}

export interface BackupHistoryItem {
  id: string;
  data: string;
  tipo: 'manual' | 'automatico';
  tamanho: string;
  registros: number;
}

class BackupService {
  // Obter histórico de backups
  getHistory(): BackupHistoryItem[] {
    const stored = localStorage.getItem(BACKUP_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Salvar histórico
  private saveHistory(history: BackupHistoryItem[]): void {
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
  }

  // Calcular tamanho em KB/MB
  private calculateSize(data: any): string {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
  }

  // Contar total de registros
  private countRecords(data: BackupData['data']): number {
    return (
      data.consultas.length +
      data.honorarios.length +
      data.medicos.length +
      data.pacientes.length +
      data.planosSaude.length +
      data.usuarios.length
    );
  }

  // Criar backup completo
  createBackup(
    consultas: Consulta[],
    honorarios: Honorario[],
    medicos: Medico[],
    pacientes: Paciente[],
    planosSaude: PlanoSaude[],
    tipo: 'manual' | 'automatico' = 'manual'
  ): BackupHistoryItem {
    const timestamp = new Date().toISOString();
    const backupId = `${BACKUP_PREFIX}${timestamp}`;
    
    // Obter usuários do service
    const usuarios = usuariosService.getAll();

    const backupData: BackupData = {
      version: '1.0',
      timestamp,
      data: {
        consultas,
        honorarios,
        medicos,
        pacientes,
        planosSaude,
        usuarios
      }
    };

    // Salvar backup no localStorage
    localStorage.setItem(backupId, JSON.stringify(backupData));

    // Criar item do histórico
    const historyItem: BackupHistoryItem = {
      id: backupId,
      data: new Date(timestamp).toLocaleString('pt-BR'),
      tipo,
      tamanho: this.calculateSize(backupData),
      registros: this.countRecords(backupData.data)
    };

    // Atualizar histórico
    const history = this.getHistory();
    history.unshift(historyItem);
    
    // Manter apenas últimos 10 backups
    if (history.length > 10) {
      const removed = history.splice(10);
      // Remover backups antigos do localStorage
      removed.forEach(item => localStorage.removeItem(item.id));
    }
    
    this.saveHistory(history);

    return historyItem;
  }

  // Obter backup específico
  getBackup(backupId: string): BackupData | null {
    const stored = localStorage.getItem(backupId);
    return stored ? JSON.parse(stored) : null;
  }

  // Restaurar backup
  restoreBackup(backupId: string): BackupData | null {
    const backup = this.getBackup(backupId);
    if (!backup) return null;

    // Restaurar todos os dados nos respectivos serviços/localStorage
    const { data } = backup;

    // Restaurar usuários via usuariosService
    localStorage.setItem('sghm_usuarios', JSON.stringify(data.usuarios));

    // Restaurar outros dados
    // Nota: Esses dados seriam restaurados pelos respectivos services
    // Por enquanto, vamos salvar em chaves temporárias que o DataContext pode usar
    localStorage.setItem('sghm_backup_consultas', JSON.stringify(data.consultas));
    localStorage.setItem('sghm_backup_honorarios', JSON.stringify(data.honorarios));
    localStorage.setItem('sghm_backup_medicos', JSON.stringify(data.medicos));
    localStorage.setItem('sghm_backup_pacientes', JSON.stringify(data.pacientes));
    localStorage.setItem('sghm_backup_planos', JSON.stringify(data.planosSaude));

    return backup;
  }

  // Exportar backup como arquivo JSON
  exportBackup(
    consultas: Consulta[],
    honorarios: Honorario[],
    medicos: Medico[],
    pacientes: Paciente[],
    planosSaude: PlanoSaude[]
  ): void {
    const usuarios = usuariosService.getAll();

    const backupData: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        consultas,
        honorarios,
        medicos,
        pacientes,
        planosSaude,
        usuarios
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-sghm-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Validar arquivo de backup
  validateBackup(data: any): { valid: boolean; error?: string } {
    if (!data.version || !data.timestamp || !data.data) {
      return { valid: false, error: 'Estrutura de backup inválida' };
    }

    const required = ['consultas', 'honorarios', 'medicos', 'pacientes', 'planosSaude', 'usuarios'];
    for (const key of required) {
      if (!Array.isArray(data.data[key])) {
        return { valid: false, error: `Tabela '${key}' inválida ou ausente` };
      }
    }

    return { valid: true };
  }

  // Importar backup de arquivo
  importBackup(backupData: BackupData): BackupHistoryItem {
    const timestamp = new Date().toISOString();
    const backupId = `${BACKUP_PREFIX}${timestamp}`;

    // Salvar backup importado
    localStorage.setItem(backupId, JSON.stringify(backupData));

    // Criar item do histórico
    const historyItem: BackupHistoryItem = {
      id: backupId,
      data: new Date(timestamp).toLocaleString('pt-BR'),
      tipo: 'manual',
      tamanho: this.calculateSize(backupData),
      registros: this.countRecords(backupData.data)
    };

    // Atualizar histórico
    const history = this.getHistory();
    history.unshift(historyItem);
    this.saveHistory(history);

    return historyItem;
  }

  // Excluir backup
  deleteBackup(backupId: string): boolean {
    const history = this.getHistory();
    const index = history.findIndex(item => item.id === backupId);
    
    if (index === -1) return false;

    history.splice(index, 1);
    this.saveHistory(history);
    localStorage.removeItem(backupId);

    return true;
  }

  // Obter último backup
  getLastBackup(): BackupHistoryItem | null {
    const history = this.getHistory();
    return history.length > 0 ? history[0] : null;
  }

  // Limpar todos os backups
  clearAllBackups(): void {
    const history = this.getHistory();
    history.forEach(item => localStorage.removeItem(item.id));
    localStorage.removeItem(BACKUP_HISTORY_KEY);
  }

  // Configurações de backup automático
  getAutoBackupConfig(): { enabled: boolean; frequency: number; lastAutoBackup: string | null } {
    const config = localStorage.getItem('sghm_auto_backup_config');
    return config ? JSON.parse(config) : { enabled: false, frequency: 24, lastAutoBackup: null };
  }

  saveAutoBackupConfig(enabled: boolean, frequency: number): void {
    const config = {
      enabled,
      frequency,
      lastAutoBackup: this.getAutoBackupConfig().lastAutoBackup
    };
    localStorage.setItem('sghm_auto_backup_config', JSON.stringify(config));
  }

  updateLastAutoBackup(): void {
    const config = this.getAutoBackupConfig();
    config.lastAutoBackup = new Date().toISOString();
    localStorage.setItem('sghm_auto_backup_config', JSON.stringify(config));
  }

  shouldCreateAutoBackup(): boolean {
    const config = this.getAutoBackupConfig();
    if (!config.enabled) return false;
    if (!config.lastAutoBackup) return true;

    const lastBackup = new Date(config.lastAutoBackup);
    const now = new Date();
    const hoursSinceLastBackup = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastBackup >= config.frequency;
  }
}

export const backupService = new BackupService();
