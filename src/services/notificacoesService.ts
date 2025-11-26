// Serviço para gerenciamento de notificações do sistema

export interface Notificacao {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  date: string; // ISO string
  actionLink?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificacaoRule {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  messageTemplate: (count: number, data?: any) => string;
  actionLink?: string;
  condition: (data: any) => boolean;
  getData: (data: any) => { count: number; data?: any };
}

const NOTIFICACOES_KEY = 'sghm_notificacoes';

class NotificacoesService {
  // Regras de negócio para geração automática de notificações
  private rules: NotificacaoRule[] = [
    {
      id: 'honorarios-pendentes-antigos',
      type: 'danger',
      title: 'Honorários Pendentes Críticos',
      messageTemplate: (count) => `${count} honorário(s) pendente(s) há mais de 30 dias`,
      actionLink: '/honorarios',
      condition: (data) => {
        const hoje = new Date();
        const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        const pendentesAntigos = data.honorarios.filter((h: any) => {
          const dataConsulta = new Date(h.dataConsulta);
          return h.status === 'PENDENTE' && dataConsulta < trintaDiasAtras;
        });
        return pendentesAntigos.length > 0;
      },
      getData: (data) => {
        const hoje = new Date();
        const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        const pendentesAntigos = data.honorarios.filter((h: any) => {
          const dataConsulta = new Date(h.dataConsulta);
          return h.status === 'PENDENTE' && dataConsulta < trintaDiasAtras;
        });
        return { count: pendentesAntigos.length };
      }
    },
    {
      id: 'honorarios-enviados-antigos',
      type: 'warning',
      title: 'Honorários Enviados sem Retorno',
      messageTemplate: (count) => `${count} honorário(s) enviado(s) há mais de 60 dias sem resposta`,
      actionLink: '/honorarios',
      condition: (data) => {
        const hoje = new Date();
        const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
        const enviadosAntigos = data.honorarios.filter((h: any) => {
          const dataConsulta = new Date(h.dataConsulta);
          return h.status === 'ENVIADO' && dataConsulta < sessentaDiasAtras;
        });
        return enviadosAntigos.length > 0;
      },
      getData: (data) => {
        const hoje = new Date();
        const sessentaDiasAtras = new Date(hoje.getTime() - 60 * 24 * 60 * 60 * 1000);
        const enviadosAntigos = data.honorarios.filter((h: any) => {
          const dataConsulta = new Date(h.dataConsulta);
          return h.status === 'ENVIADO' && dataConsulta < sessentaDiasAtras;
        });
        return { count: enviadosAntigos.length };
      }
    },
    {
      id: 'taxa-glosa-alta',
      type: 'warning',
      title: 'Taxa de Glosa Elevada',
      messageTemplate: (count, data) => `Taxa de glosa atual: ${data.taxaGlosa.toFixed(1)}%. Recomendado: < 15%`,
      actionLink: '/relatorios',
      condition: (data) => {
        const totalHonorarios = data.honorarios.length;
        const honorariosGlosados = data.honorarios.filter((h: any) => h.status === 'GLOSADO').length;
        const taxaGlosa = totalHonorarios > 0 ? (honorariosGlosados / totalHonorarios) * 100 : 0;
        return taxaGlosa > 15;
      },
      getData: (data) => {
        const totalHonorarios = data.honorarios.length;
        const honorariosGlosados = data.honorarios.filter((h: any) => h.status === 'GLOSADO').length;
        const taxaGlosa = totalHonorarios > 0 ? (honorariosGlosados / totalHonorarios) * 100 : 0;
        return { count: honorariosGlosados, data: { taxaGlosa } };
      }
    },
    {
      id: 'honorarios-pendentes',
      type: 'info',
      title: 'Honorários Aguardando Envio',
      messageTemplate: (count) => `${count} honorário(s) pendente(s) de envio ao plano de saúde`,
      actionLink: '/honorarios',
      condition: (data) => {
        const honorariosPendentes = data.honorarios.filter((h: any) => h.status === 'PENDENTE').length;
        return honorariosPendentes > 10;
      },
      getData: (data) => {
        const honorariosPendentes = data.honorarios.filter((h: any) => h.status === 'PENDENTE').length;
        return { count: honorariosPendentes };
      }
    },
    {
      id: 'consultas-sem-honorario',
      type: 'warning',
      title: 'Consultas sem Honorário',
      messageTemplate: (count) => `${count} consulta(s) de convênio sem honorário vinculado`,
      actionLink: '/consultas',
      condition: (data) => {
        const consultasConvenio = data.consultas.filter((c: any) => c.tipoPagamento === 'convenio' && c.planoSaudeId);
        const consultasSemHonorario = consultasConvenio.filter((consulta: any) => {
          return !data.honorarios.some((h: any) => h.consultaId === consulta.id);
        });
        return consultasSemHonorario.length > 0;
      },
      getData: (data) => {
        const consultasConvenio = data.consultas.filter((c: any) => c.tipoPagamento === 'convenio' && c.planoSaudeId);
        const consultasSemHonorario = consultasConvenio.filter((consulta: any) => {
          return !data.honorarios.some((h: any) => h.consultaId === consulta.id);
        });
        return { count: consultasSemHonorario.length };
      }
    }
  ];

  // Carregar notificações do localStorage
  private getNotificacoes(): Notificacao[] {
    const data = localStorage.getItem(NOTIFICACOES_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Salvar notificações no localStorage
  private saveNotificacoes(notificacoes: Notificacao[]): void {
    localStorage.setItem(NOTIFICACOES_KEY, JSON.stringify(notificacoes));
  }

  // Gerar ID único
  private gerarId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Atualizar notificações baseado em regras e dados atuais
  atualizarNotificacoes(data: { honorarios: any[]; consultas: any[] }): void {
    const notificacoesExistentes = this.getNotificacoes();
    const agora = new Date().toISOString();
    
    this.rules.forEach(rule => {
      if (rule.condition(data)) {
        // Verificar se já existe notificação ativa para esta regra
        const notifExistente = notificacoesExistentes.find(
          n => n.id.startsWith(rule.id) && !n.isDismissed
        );

        if (!notifExistente) {
          // Criar nova notificação
          const { count, data: ruleData } = rule.getData(data);
          const novaNotificacao: Notificacao = {
            id: `${rule.id}_${Date.now()}`,
            type: rule.type,
            title: rule.title,
            message: rule.messageTemplate(count, ruleData),
            date: agora,
            actionLink: rule.actionLink,
            isRead: false,
            isDismissed: false,
            createdAt: agora,
            updatedAt: agora
          };
          notificacoesExistentes.push(novaNotificacao);
        }
      } else {
        // Remover notificações desta regra se condição não é mais válida
        const indices = notificacoesExistentes
          .map((n, i) => (n.id.startsWith(rule.id) && !n.isDismissed ? i : -1))
          .filter(i => i !== -1);
        
        indices.reverse().forEach(i => {
          notificacoesExistentes.splice(i, 1);
        });
      }
    });

    this.saveNotificacoes(notificacoesExistentes);
  }

  // Obter todas notificações (incluindo lidas e dispensadas)
  getAllNotificacoes(): Notificacao[] {
    return this.getNotificacoes();
  }

  // Obter notificações ativas (não dispensadas)
  getNotificacoesAtivas(): Notificacao[] {
    return this.getNotificacoes().filter(n => !n.isDismissed);
  }

  // Obter notificações não lidas
  getNotificacoesNaoLidas(): Notificacao[] {
    return this.getNotificacoes().filter(n => !n.isRead && !n.isDismissed);
  }

  // Contar notificações não lidas
  contarNaoLidas(): number {
    return this.getNotificacoesNaoLidas().length;
  }

  // Marcar notificação como lida
  marcarComoLida(id: string): void {
    const notificacoes = this.getNotificacoes();
    const notificacao = notificacoes.find(n => n.id === id);
    if (notificacao) {
      notificacao.isRead = true;
      notificacao.updatedAt = new Date().toISOString();
      this.saveNotificacoes(notificacoes);
    }
  }

  // Marcar todas como lidas
  marcarTodasComoLidas(): void {
    const notificacoes = this.getNotificacoes();
    const agora = new Date().toISOString();
    notificacoes.forEach(n => {
      if (!n.isDismissed) {
        n.isRead = true;
        n.updatedAt = agora;
      }
    });
    this.saveNotificacoes(notificacoes);
  }

  // Dispensar notificação (ocultar permanentemente)
  dispensar(id: string): void {
    const notificacoes = this.getNotificacoes();
    const notificacao = notificacoes.find(n => n.id === id);
    if (notificacao) {
      notificacao.isDismissed = true;
      notificacao.isRead = true;
      notificacao.updatedAt = new Date().toISOString();
      this.saveNotificacoes(notificacoes);
    }
  }

  // Limpar notificações antigas (mais de 30 dias e já lidas/dispensadas)
  limparAntigas(): void {
    const notificacoes = this.getNotificacoes();
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const notificacoesAtivas = notificacoes.filter(n => {
      if (n.isDismissed && n.date < trintaDiasAtras) {
        return false; // Remover dispensadas antigas
      }
      return true;
    });
    
    this.saveNotificacoes(notificacoesAtivas);
  }

  // Criar notificação customizada
  criar(
    type: 'warning' | 'danger' | 'info' | 'success',
    title: string,
    message: string,
    actionLink?: string
  ): Notificacao {
    const agora = new Date().toISOString();
    const novaNotificacao: Notificacao = {
      id: this.gerarId(),
      type,
      title,
      message,
      date: agora,
      actionLink,
      isRead: false,
      isDismissed: false,
      createdAt: agora,
      updatedAt: agora
    };

    const notificacoes = this.getNotificacoes();
    notificacoes.push(novaNotificacao);
    this.saveNotificacoes(notificacoes);

    return novaNotificacao;
  }

  // Limpar todas notificações (apenas para testes)
  limparTodas(): void {
    localStorage.removeItem(NOTIFICACOES_KEY);
  }
}

export const notificacoesService = new NotificacoesService();
