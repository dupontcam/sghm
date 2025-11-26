import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaCalendar, FaUser, FaComments, FaLaptop, FaFileDownload } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { avaliacoesService, Avaliacao } from '../services/avaliacoesService';
import './Satisfacao.css';

const Satisfacao: React.FC = () => {
  const { user, userProfile } = useAuth();
  
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [notaSelecionada, setNotaSelecionada] = useState<1 | 2 | 3 | 4 | 5 | 0>(0);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<'usabilidade' | 'interface' | 'relatorios' | 'desempenho' | 'geral'>('geral');
  const [comentario, setComentario] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; mensagem: string } | null>(null);
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'7dias' | '30dias' | '90dias' | 'todos'>('todos');

  useEffect(() => {
    // Inicializar avaliações mockadas se necessário
    if (user) {
      avaliacoesService.initialize([
        { id: user.id, nome: user.nome, perfil: userProfile }
      ]);
    }
    carregarAvaliacoes();
  }, []);

  const carregarAvaliacoes = () => {
    let listaAvaliacoes = avaliacoesService.getAllAvaliacoes();
    
    // Filtrar por categoria
    if (filtroCategoria !== 'todas') {
      listaAvaliacoes = listaAvaliacoes.filter(a => a.categoria === filtroCategoria);
    }
    
    // Filtrar por período
    if (filtroPeriodo !== 'todos') {
      const agora = new Date();
      const dias = filtroPeriodo === '7dias' ? 7 : filtroPeriodo === '30dias' ? 30 : 90;
      const dataLimite = new Date(agora.setDate(agora.getDate() - dias));
      listaAvaliacoes = listaAvaliacoes.filter(a => new Date(a.data) >= dataLimite);
    }
    
    // Ordenar por data (mais recentes primeiro)
    listaAvaliacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    setAvaliacoes(listaAvaliacoes);
  };

  useEffect(() => {
    carregarAvaliacoes();
  }, [filtroCategoria, filtroPeriodo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setFeedback({ tipo: 'error', mensagem: 'Usuário não autenticado.' });
      return;
    }
    
    if (notaSelecionada === 0) {
      setFeedback({ tipo: 'error', mensagem: 'Selecione uma nota de 1 a 5 estrelas.' });
      return;
    }
    
    avaliacoesService.createAvaliacao(
      notaSelecionada,
      categoriaSelecionada,
      comentario || undefined,
      user.nome,
      user.id,
      userProfile
    );
    
    // Limpar formulário
    setNotaSelecionada(0);
    setCategoriaSelecionada('geral');
    setComentario('');
    
    setFeedback({ tipo: 'success', mensagem: 'Avaliação registrada com sucesso!' });
    carregarAvaliacoes();
    
    setTimeout(() => setFeedback(null), 3000);
  };

  const renderEstrelas = (nota: number, onSelect?: (n: 1 | 2 | 3 | 4 | 5) => void) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      const preenchida = i <= nota;
      estrelas.push(
        <span
          key={i}
          className={`estrela ${onSelect ? 'clickable' : ''} ${preenchida ? 'preenchida' : ''}`}
          onClick={() => onSelect && onSelect(i as 1 | 2 | 3 | 4 | 5)}
        >
          {preenchida ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return <div className="estrelas-container">{estrelas}</div>;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      usabilidade: 'Usabilidade',
      interface: 'Interface',
      relatorios: 'Relatórios',
      desempenho: 'Desempenho',
      geral: 'Geral'
    };
    return labels[categoria] || categoria;
  };

  const exportarRelatorio = () => {
    const estatisticas = avaliacoesService.getEstatisticasGerais();
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    // Montar relatório em texto
    let relatorio = `RELATÓRIO DE SATISFAÇÃO COM O SISTEMA SGHM\n`;
    relatorio += `Data de Geração: ${dataAtual}\n`;
    relatorio += `${'='.repeat(60)}\n\n`;
    
    relatorio += `RESUMO GERAL\n`;
    relatorio += `${'-'.repeat(60)}\n`;
    relatorio += `Nota Média Geral: ${estatisticas.notaMedia.toFixed(2)} / 5.0\n`;
    relatorio += `Total de Avaliações: ${estatisticas.totalAvaliacoes}\n\n`;
    
    relatorio += `DISTRIBUIÇÃO DE NOTAS\n`;
    relatorio += `${'-'.repeat(60)}\n`;
    Object.entries(estatisticas.distribuicaoNotas).forEach(([nota, quantidade]) => {
      const porcentagem = ((quantidade / estatisticas.totalAvaliacoes) * 100).toFixed(1);
      relatorio += `${nota} estrela${nota !== '1' ? 's' : ''}: ${quantidade} (${porcentagem}%)\n`;
    });
    
    relatorio += `\nAVALIAÇÕES POR ASPECTO\n`;
    relatorio += `${'-'.repeat(60)}\n`;
    estatisticas.avaliacoesPorCategoria.forEach(cat => {
      relatorio += `${cat.categoria}: ${cat.media.toFixed(2)} / 5.0 (${cat.total} avaliações)\n`;
    });
    
    relatorio += `\nAVALIAÇÕES POR PERFIL DE USUÁRIO\n`;
    relatorio += `${'-'.repeat(60)}\n`;
    estatisticas.avaliacoesPorPerfil.forEach(perfil => {
      relatorio += `${perfil.perfil}: ${perfil.media.toFixed(2)} / 5.0 (${perfil.total} avaliações)\n`;
    });
    
    relatorio += `\nEVOLUÇÃO MENSAL (Últimos 6 meses)\n`;
    relatorio += `${'-'.repeat(60)}\n`;
    estatisticas.avaliacoesPorMes.forEach(mes => {
      relatorio += `${mes.mes}: ${mes.media.toFixed(2)} / 5.0 (${mes.total} avaliações)\n`;
    });
    
    relatorio += `\nCOMENTÁRIOS DETALHADOS\n`;
    relatorio += `${'-'.repeat(60)}\n`;
    avaliacoes.forEach((av, index) => {
      relatorio += `\n[${index + 1}] ${formatarData(av.data)}\n`;
      relatorio += `Aspecto: ${getCategoriaLabel(av.categoria)}\n`;
      relatorio += `Nota: ${'★'.repeat(av.nota)}${'☆'.repeat(5 - av.nota)} (${av.nota}/5)\n`;
      relatorio += `Avaliador: ${av.respondidoPor} (${av.perfilUsuario || 'N/A'})\n`;
      if (av.comentario) {
        relatorio += `Comentário: ${av.comentario}\n`;
      }
      relatorio += `${'-'.repeat(40)}\n`;
    });
    
    relatorio += `\n${'='.repeat(60)}\n`;
    relatorio += `Relatório gerado automaticamente pelo Sistema SGHM\n`;
    
    // Criar blob e fazer download
    const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-satisfacao-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setFeedback({ tipo: 'success', mensagem: 'Relatório exportado com sucesso!' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const notaMediaGeral = avaliacoesService.getNotaMediaGeral();

  return (
    <div className="satisfacao-container">
      <div className="page-header">
        <div>
          <h1><FaLaptop /> Pesquisa de Satisfação com o Sistema</h1>
          <p className="page-subtitle">Avalie sua experiência de uso da plataforma SGHM</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {avaliacoes.length > 0 && (
            <>
              <button 
                onClick={exportarRelatorio}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                title="Exportar relatório completo de satisfação"
              >
                <FaFileDownload /> Exportar Relatório
              </button>
              <div className="nota-media-badge">
                <span className="nota-label">Nota Média Geral:</span>
                <div className="nota-valor">
                  <FaStar className="star-icon" />
                  <strong>{notaMediaGeral.toFixed(1)}</strong>
                  <span className="nota-max">/5.0</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Formulário de Nova Avaliação */}
      <div className="satisfacao-card">
        <h2>
          <FaComments /> Nova Avaliação do Sistema
        </h2>
        <form onSubmit={handleSubmit} className="satisfacao-form">
          <div className="form-row">
            <div className="form-group">
              <label>Aspecto a Avaliar *</label>
              <select
                value={categoriaSelecionada}
                onChange={e => setCategoriaSelecionada(e.target.value as any)}
                required
              >
                <option value="geral">Geral (Experiência Completa)</option>
                <option value="usabilidade">Usabilidade (Facilidade de Uso)</option>
                <option value="interface">Interface (Design e Layout)</option>
                <option value="relatorios">Relatórios e Gráficos</option>
                <option value="desempenho">Desempenho (Velocidade)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Nota (1 a 5 estrelas) *</label>
            {renderEstrelas(notaSelecionada, setNotaSelecionada)}
            <small style={{ marginTop: '5px', display: 'block', color: '#6c757d' }}>
              1 = Muito Insatisfeito | 3 = Neutro | 5 = Muito Satisfeito
            </small>
          </div>

          <div className="form-group">
            <label>Comentário (opcional)</label>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={4}
              placeholder="Deixe seu comentário sobre sua experiência com o sistema..."
              maxLength={500}
            />
            <small>{comentario.length}/500 caracteres</small>
          </div>

          <button type="submit" className="btn btn-primary">
            Registrar Avaliação
          </button>

          {feedback && (
            <div className={`feedback-message ${feedback.tipo}`}>
              {feedback.mensagem}
            </div>
          )}
        </form>
      </div>

      {/* Filtros */}
      <div className="satisfacao-card">
        <h2>Histórico de Avaliações</h2>
        <div className="filtros-container">
          <div className="form-group">
            <label>Filtrar por Aspecto:</label>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
              <option value="todas">Todos os aspectos</option>
              <option value="geral">Geral</option>
              <option value="usabilidade">Usabilidade</option>
              <option value="interface">Interface</option>
              <option value="relatorios">Relatórios</option>
              <option value="desempenho">Desempenho</option>
            </select>
          </div>

          <div className="form-group">
            <label>Filtrar por Período:</label>
            <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value as any)}>
              <option value="todos">Todos</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="90dias">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="avaliacoes-lista">
        {avaliacoes.length === 0 ? (
          <div className="no-data">
            Nenhuma avaliação encontrada com os filtros selecionados.
          </div>
        ) : (
          avaliacoes.map(avaliacao => (
            <div key={avaliacao.id} className="avaliacao-item">
              <div className="avaliacao-header">
                <div className="avaliacao-medico">
                  <FaLaptop className="icon" />
                  <strong>Aspecto: {getCategoriaLabel(avaliacao.categoria)}</strong>
                  {avaliacao.perfilUsuario && (
                    <span className={`categoria-badge perfil-${avaliacao.perfilUsuario.toLowerCase()}`}>
                      {avaliacao.perfilUsuario}
                    </span>
                  )}
                </div>
                <div className="avaliacao-nota">
                  {renderEstrelas(avaliacao.nota)}
                </div>
              </div>

              {avaliacao.comentario && (
                <div className="avaliacao-comentario">
                  <p>{avaliacao.comentario}</p>
                </div>
              )}

              <div className="avaliacao-footer">
                <span className="avaliacao-autor">
                  <FaUser className="icon" />
                  Por: {avaliacao.respondidoPor}
                </span>
                <span className="avaliacao-data">
                  <FaCalendar className="icon" />
                  {formatarData(avaliacao.data)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Satisfacao;
