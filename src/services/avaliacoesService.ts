// Serviço para gerenciamento de avaliações de satisfação com o sistema

export interface Avaliacao {
  id: string;
  data: string; // ISO string
  nota: 1 | 2 | 3 | 4 | 5; // Escala de 1 a 5
  categoria: 'usabilidade' | 'interface' | 'relatorios' | 'desempenho' | 'geral';
  comentario?: string;
  respondidoPor: string; // Nome do usuário que respondeu
  respondidoPorId: number; // ID do usuário
  perfilUsuario: 'Admin' | 'Operador'; // Perfil de quem avaliou
  createdAt: string;
}

export interface EstatisticasAvaliacao {
  notaMedia: number;
  totalAvaliacoes: number;
  distribuicaoNotas: { [key: number]: number }; // { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 }
  avaliacoesPorMes: { mes: string; media: number; total: number }[];
  avaliacoesPorCategoria: { categoria: string; media: number; total: number }[];
  avaliacoesPorPerfil: { perfil: string; media: number; total: number }[];
}

const AVALIACOES_KEY = 'sghm_avaliacoes';

class AvaliacoesService {
  // Carregar avaliações do localStorage
  private getAvaliacoes(): Avaliacao[] {
    const data = localStorage.getItem(AVALIACOES_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Salvar avaliações no localStorage
  private saveAvaliacoes(avaliacoes: Avaliacao[]): void {
    localStorage.setItem(AVALIACOES_KEY, JSON.stringify(avaliacoes));
  }

  // Gerar ID único
  private gerarId(): string {
    return `aval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Criar nova avaliação
  createAvaliacao(
    nota: 1 | 2 | 3 | 4 | 5,
    categoria: 'usabilidade' | 'interface' | 'relatorios' | 'desempenho' | 'geral',
    comentario: string | undefined,
    respondidoPor: string,
    respondidoPorId: number,
    perfilUsuario: 'Admin' | 'Operador'
  ): Avaliacao {
    const avaliacoes = this.getAvaliacoes();
    const novaAvaliacao: Avaliacao = {
      id: this.gerarId(),
      data: new Date().toISOString(),
      nota,
      categoria,
      comentario,
      respondidoPor,
      respondidoPorId,
      perfilUsuario,
      createdAt: new Date().toISOString()
    };

    avaliacoes.push(novaAvaliacao);
    this.saveAvaliacoes(avaliacoes);
    return novaAvaliacao;
  }

  // Listar todas avaliações
  getAllAvaliacoes(): Avaliacao[] {
    return this.getAvaliacoes();
  }



  // Listar avaliações por período
  getAvaliacoesByPeriodo(dataInicio: string, dataFim: string): Avaliacao[] {
    const avaliacoes = this.getAvaliacoes();
    return avaliacoes.filter(a => {
      const dataAvaliacao = new Date(a.data);
      return dataAvaliacao >= new Date(dataInicio) && dataAvaliacao <= new Date(dataFim);
    });
  }

  // Calcular nota média geral
  getNotaMediaGeral(): number {
    const avaliacoes = this.getAvaliacoes();
    if (avaliacoes.length === 0) return 0;
    const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
    return soma / avaliacoes.length;
  }



  // Estatísticas gerais
  getEstatisticasGerais(): EstatisticasAvaliacao {
    const avaliacoes = this.getAvaliacoes();
    
    // Nota média
    const notaMedia = this.getNotaMediaGeral();
    
    // Total de avaliações
    const totalAvaliacoes = avaliacoes.length;
    
    // Distribuição de notas
    const distribuicaoNotas: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    avaliacoes.forEach(a => {
      distribuicaoNotas[a.nota] = (distribuicaoNotas[a.nota] || 0) + 1;
    });
    
    // Avaliações por mês (últimos 6 meses)
    const avaliacoesPorMes = this.getAvaliacoesPorMes(6);
    
    // Avaliações por categoria
    const categorias: { [key: string]: { soma: number; total: number } } = {};
    avaliacoes.forEach(a => {
      if (!categorias[a.categoria]) {
        categorias[a.categoria] = { soma: 0, total: 0 };
      }
      categorias[a.categoria].soma += a.nota;
      categorias[a.categoria].total += 1;
    });
    
    const avaliacoesPorCategoria = Object.entries(categorias).map(([cat, dados]) => ({
      categoria: cat,
      media: dados.total > 0 ? dados.soma / dados.total : 0,
      total: dados.total
    }));
    
    // Avaliações por perfil
    const perfis: { [key: string]: { soma: number; total: number } } = {};
    avaliacoes.forEach(a => {
      if (!perfis[a.perfilUsuario]) {
        perfis[a.perfilUsuario] = { soma: 0, total: 0 };
      }
      perfis[a.perfilUsuario].soma += a.nota;
      perfis[a.perfilUsuario].total += 1;
    });
    
    const avaliacoesPorPerfil = Object.entries(perfis).map(([perfil, dados]) => ({
      perfil,
      media: dados.total > 0 ? dados.soma / dados.total : 0,
      total: dados.total
    }));
    
    return {
      notaMedia,
      totalAvaliacoes,
      distribuicaoNotas,
      avaliacoesPorMes,
      avaliacoesPorCategoria,
      avaliacoesPorPerfil
    };
  }

  // Avaliações por mês (histórico)
  private getAvaliacoesPorMes(quantidadeMeses: number): { mes: string; media: number; total: number }[] {
    const avaliacoes = this.getAvaliacoes();
    const meses: { [key: string]: { soma: number; total: number } } = {};
    
    const agora = new Date();
    for (let i = quantidadeMeses - 1; i >= 0; i--) {
      const data = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses[chave] = { soma: 0, total: 0 };
    }
    
    avaliacoes.forEach(a => {
      const data = new Date(a.data);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (meses[chave]) {
        meses[chave].soma += a.nota;
        meses[chave].total += 1;
      }
    });
    
    return Object.entries(meses).map(([mes, dados]) => ({
      mes,
      media: dados.total > 0 ? dados.soma / dados.total : 0,
      total: dados.total
    }));
  }



  // Deletar avaliação (apenas para testes/admin)
  deleteAvaliacao(id: string): boolean {
    const avaliacoes = this.getAvaliacoes();
    const novasAvaliacoes = avaliacoes.filter(a => a.id !== id);
    if (novasAvaliacoes.length < avaliacoes.length) {
      this.saveAvaliacoes(novasAvaliacoes);
      return true;
    }
    return false;
  }

  // Limpar todas avaliações (apenas para testes)
  clearAvaliacoes(): void {
    localStorage.removeItem(AVALIACOES_KEY);
  }

  // Inicializar com dados mock (primeira vez)
  initialize(usuarios: { id: number; nome: string; perfil: 'Admin' | 'Operador' }[]): void {
    const avaliacoes = this.getAvaliacoes();
    
    // Verificar se há avaliações antigas sem perfilUsuario (formato antigo)
    const temAvaliacoesAntigas = avaliacoes.some(a => !a.perfilUsuario);
    
    if (avaliacoes.length > 0 && !temAvaliacoesAntigas) return; // Já inicializado com formato correto
    
    // Limpar dados antigos incompatíveis
    if (temAvaliacoesAntigas) {
      console.log('⚠️ Detectado formato antigo de avaliações. Limpando dados...');
      this.clearAvaliacoes();
    }

    // Criar 12 avaliações mockadas sobre o sistema
    const categorias: Array<'usabilidade' | 'interface' | 'relatorios' | 'desempenho' | 'geral'> = ['usabilidade', 'interface', 'relatorios', 'desempenho', 'geral'];
    const notas: Array<1 | 2 | 3 | 4 | 5> = [5, 5, 4, 4, 4, 3, 5, 5, 4, 4, 3, 5];
    const comentariosMock = [
      'Sistema muito intuitivo e fácil de usar!',
      'Interface moderna e agradável.',
      'Relatórios muito completos e úteis.',
      'Desempenho excelente, rápido e eficiente.',
      'Adorei a organização geral do sistema!',
      'Interface poderia ter mais opções de personalização.',
      'Dashboard muito informativo!',
      'Gráficos muito claros e objetivos.',
      'Sistema atende todas as minhas necessidades.',
      'Transparência total nos dados apresentados.',
      '',
      'Recomendo fortemente este sistema!'
    ];

    const agora = new Date();
    const mockAvaliacoes: Avaliacao[] = [];

    for (let i = 0; i < 12; i++) {
      const usuarioAleatorio = usuarios[i % usuarios.length];
      const diasAtras = Math.floor(Math.random() * 90); // Últimos 90 dias
      const dataAvaliacao = new Date(agora);
      dataAvaliacao.setDate(dataAvaliacao.getDate() - diasAtras);

      mockAvaliacoes.push({
        id: this.gerarId(),
        data: dataAvaliacao.toISOString(),
        nota: notas[i],
        categoria: categorias[i % categorias.length],
        comentario: comentariosMock[i] || undefined,
        respondidoPor: usuarioAleatorio.nome,
        respondidoPorId: usuarioAleatorio.id,
        perfilUsuario: usuarioAleatorio.perfil,
        createdAt: dataAvaliacao.toISOString()
      });
    }

    this.saveAvaliacoes(mockAvaliacoes);
    console.log('✅ Avaliações do sistema inicializadas:', mockAvaliacoes.length);
  }
}

export const avaliacoesService = new AvaliacoesService();
