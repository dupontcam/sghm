import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Consulta, Medico, Paciente, Honorario, PlanoSaude, calcularTempoMedioPagamento, calcularValorLiquido } from '../data/mockData';
import { FaPrint, FaFileDownload, FaChartBar, FaUserMd, FaHospital, FaBan, FaCheckCircle, FaClock, FaCalendarAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './RegistroConsultas.css';
import './ControleFinanceiro.css';
import './Relatorios.css';

// Tipos de relatórios disponíveis
type TipoRelatorio = 'geral' | 'medico' | 'plano' | 'glosas' | 'tempo-pagamento';

const Relatorios: React.FC = () => {
  const { consultas, medicos, pacientes, honorarios, planosSaude } = useData();

  // Estados para os filtros
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('geral');
  const [filtroMedico, setFiltroMedico] = useState<number>(0);
  const [filtroPlano, setFiltroPlano] = useState<number>(0);
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  const [showReport, setShowReport] = useState(false);

  const getPacienteNome = (id: number) => pacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => medicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';
  const getPlanoNome = (id: number | null | undefined) => {
    if (!id) return 'Particular';
    return planosSaude.find((p: PlanoSaude) => p.id === id)?.nome || 'Não encontrado';
  };

  // Filtragem de honorários
  const honorariosFiltrados = useMemo(() => {
    if (!showReport) return [];

    return honorarios.filter(honorario => {
      // Filtro de Médico
      if (filtroMedico !== 0 && honorario.medicoId !== filtroMedico) {
        return false;
      }
      // Filtro de Plano
      if (filtroPlano !== 0 && honorario.planoSaudeId !== filtroPlano) {
        return false;
      }
      // Filtro de Data Início
      if (filtroDataInicio && new Date(honorario.dataConsulta) < new Date(filtroDataInicio)) {
        return false;
      }
      // Filtro de Data Fim
      if (filtroDataFim && new Date(honorario.dataConsulta) > new Date(filtroDataFim)) {
        return false;
      }
      return true;
    });
  }, [honorarios, filtroMedico, filtroPlano, filtroDataInicio, filtroDataFim, showReport]);

  // Estatísticas por médico
  const estatisticasPorMedico = useMemo(() => {
    const stats = new Map<number, {
      nome: string;
      totalHonorarios: number;
      valorTotal: number;
      valorPago: number;
      valorGlosado: number;
      taxaGlosa: number;
    }>();

    honorariosFiltrados.forEach(h => {
      if (!stats.has(h.medicoId)) {
        stats.set(h.medicoId, {
          nome: getMedicoNome(h.medicoId),
          totalHonorarios: 0,
          valorTotal: 0,
          valorPago: 0,
          valorGlosado: 0,
          taxaGlosa: 0
        });
      }

      const stat = stats.get(h.medicoId)!;
      stat.totalHonorarios++;
      stat.valorTotal += (h.valor || 0);

      if (h.status === 'PAGO') {
        stat.valorPago += calcularValorLiquido(h);
      }
      if (h.valorGlosa) {
        stat.valorGlosado += h.valorGlosa;
      }
    });

    // Calcular taxa de glosa
    stats.forEach(stat => {
      if (stat.valorTotal > 0) {
        stat.taxaGlosa = (stat.valorGlosado / stat.valorTotal) * 100;
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [honorariosFiltrados]);

  // Estatísticas por plano de saúde
  const estatisticasPorPlano = useMemo(() => {
    const stats = new Map<number, {
      nome: string;
      totalHonorarios: number;
      valorTotal: number;
      valorPago: number;
      valorGlosado: number;
      valorPendente: number;
      taxaGlosa: number;
    }>();

    honorariosFiltrados.forEach(h => {
      const planoId = h.planoSaudeId || 0;
      if (!stats.has(planoId)) {
        stats.set(planoId, {
          nome: getPlanoNome(planoId),
          totalHonorarios: 0,
          valorTotal: 0,
          valorPago: 0,
          valorGlosado: 0,
          valorPendente: 0,
          taxaGlosa: 0
        });
      }

      const stat = stats.get(planoId)!;
      stat.totalHonorarios++;
      stat.valorTotal += (h.valor || 0);

      if (h.status === 'PAGO') {
        stat.valorPago += calcularValorLiquido(h);
      } else if (h.status === 'PENDENTE' || h.status === 'ENVIADO') {
        stat.valorPendente += (h.valor || 0);
      }

      if (h.valorGlosa) {
        stat.valorGlosado += h.valorGlosa;
      }
    });

    // Calcular taxa de glosa
    stats.forEach(stat => {
      if (stat.valorTotal > 0) {
        stat.taxaGlosa = (stat.valorGlosado / stat.valorTotal) * 100;
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [honorariosFiltrados]);

  // Estatísticas de glosas
  const estatisticasGlosas = useMemo(() => {
    const glosas = honorariosFiltrados.filter(h => h.status === 'GLOSADO');
    const totalGlosado = glosas.reduce((sum, h) => sum + (h.valorGlosa || 0), 0);
    const totalValor = glosas.reduce((sum, h) => sum + (h.valor || 0), 0);

    // Agrupar por motivo
    const porMotivo = new Map<string, { count: number; valor: number }>();
    glosas.forEach(h => {
      const motivo = h.motivoGlosa || 'Sem motivo informado';
      if (!porMotivo.has(motivo)) {
        porMotivo.set(motivo, { count: 0, valor: 0 });
      }
      const stat = porMotivo.get(motivo)!;
      stat.count++;
      stat.valor += (h.valorGlosa || 0);
    });

    return {
      totalGlosas: glosas.length,
      totalGlosado,
      totalValor,
      taxaGlosa: totalValor > 0 ? (totalGlosado / totalValor) * 100 : 0,
      porMotivo: Array.from(porMotivo.entries())
        .map(([motivo, data]) => ({ motivo, ...data }))
        .sort((a, b) => b.valor - a.valor)
    };
  }, [honorariosFiltrados]);

  // Resumo geral
  const resumoGeral = useMemo(() => {
    let valorTotal = 0;
    let valorPago = 0;
    let valorGlosado = 0;
    let valorPendente = 0;
    let valorEnviado = 0;

    honorariosFiltrados.forEach(h => {
      const valor = h.valor || 0;
      valorTotal += valor;

      if (h.status === 'PAGO') {
        valorPago += calcularValorLiquido(h);
      } else if (h.status === 'PENDENTE') {
        valorPendente += valor;
      } else if (h.status === 'ENVIADO') {
        valorEnviado += valor;
      }

      if (h.valorGlosa) {
        valorGlosado += h.valorGlosa;
      }
    });

    return {
      valorTotal,
      valorPago,
      valorGlosado,
      valorPendente,
      valorEnviado,
      taxaGlosa: valorTotal > 0 ? (valorGlosado / valorTotal) * 100 : 0,
      totalHonorarios: honorariosFiltrados.length
    };
  }, [honorariosFiltrados]);

  // Análise de tempo médio de pagamento por mês
  const analiseTempoMensal = useMemo(() => {
    const consultasFiltradas = consultas.filter(c => {
      if (filtroDataInicio && new Date(c.dataConsulta) < new Date(filtroDataInicio)) return false;
      if (filtroDataFim && new Date(c.dataConsulta) > new Date(filtroDataFim)) return false;
      return true;
    });

    // Agrupar por mês
    const consultasPorMes = new Map<string, Consulta[]>();

    consultasFiltradas.forEach(consulta => {
      if (consulta.status === 'Pago' && consulta.dataRecebimento) {
        const data = new Date(consulta.dataConsulta);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

        if (!consultasPorMes.has(mesAno)) {
          consultasPorMes.set(mesAno, []);
        }
        consultasPorMes.get(mesAno)!.push(consulta);
      }
    });

    // Calcular estatísticas por mês
    const estatisticasMensais = Array.from(consultasPorMes.entries()).map(([mesAno, consultasMes]) => {
      const tempoMedio = calcularTempoMedioPagamento(consultasMes);
      const [ano, mes] = mesAno.split('-');
      const nomeMes = new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      return {
        mesAno,
        nomeMes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        tempoMedioDias: tempoMedio,
        quantidadeConsultas: consultasMes.length,
        valorTotal: consultasMes.reduce((acc, c) => acc + (c.valorRecebido || 0), 0)
      };
    }).sort((a, b) => a.mesAno.localeCompare(b.mesAno));

    const tempoMedioGeral = calcularTempoMedioPagamento(consultasFiltradas);

    return {
      estatisticasMensais,
      tempoMedioGeral,
      totalConsultasPagas: consultasFiltradas.filter(c => c.status === 'Pago' && c.dataRecebimento).length
    };
  }, [consultas, filtroDataInicio, filtroDataFim]);

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Configurações
    const margemEsquerda = 14;
    let yPosition = 20;

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');

    const titulos: { [key: string]: string } = {
      'geral': 'Relatorio Geral de Honorarios',
      'medico': 'Relatorio por Medico',
      'plano': 'Relatorio por Plano de Saude',
      'glosas': 'Relatorio de Glosas',
      'tempo-pagamento': 'Relatorio de Tempo Medio de Pagamento'
    };

    doc.text(titulos[tipoRelatorio] || 'Relatorio', margemEsquerda, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${dataAtual}`, margemEsquerda, yPosition);

    yPosition += 6;
    doc.text(`Médico: ${filtroMedico === 0 ? 'Todos' : getMedicoNome(filtroMedico)}`, margemEsquerda, yPosition);

    yPosition += 6;
    doc.text(`Plano: ${filtroPlano === 0 ? 'Todos' : getPlanoNome(filtroPlano)}`, margemEsquerda, yPosition);

    yPosition += 6;
    const periodoInicio = filtroDataInicio ? new Date(filtroDataInicio).toLocaleDateString('pt-BR') : 'Início';
    const periodoFim = filtroDataFim ? new Date(filtroDataFim).toLocaleDateString('pt-BR') : 'Hoje';
    doc.text(`Período: ${periodoInicio} a ${periodoFim}`, margemEsquerda, yPosition);

    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margemEsquerda, yPosition, 196, yPosition);
    yPosition += 10;

    // Conteúdo específico por tipo de relatório
    if (tipoRelatorio === 'geral') {
      // Cards de resumo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Financeiro', margemEsquerda, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Processado: ${resumoGeral.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Total Pago: ${resumoGeral.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Total Glosado: ${resumoGeral.valorGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${resumoGeral.taxaGlosa.toFixed(1)}%)`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Total Pendente: ${resumoGeral.valorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margemEsquerda, yPosition);
      yPosition += 10;

      // Tabela de honorários
      const honorariosData = honorariosFiltrados.map(h => [
        h.numeroGuia || '-',
        getMedicoNome(h.medicoId),
        getPlanoNome(h.planoSaudeId),
        new Date(h.dataConsulta).toLocaleDateString('pt-BR'),
        h.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        (h.valorGlosa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        calcularValorLiquido(h).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        h.status
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Guia', 'Médico', 'Plano', 'Data', 'Valor', 'Glosa', 'Líquido', 'Status']],
        body: honorariosData,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255], textColor: 255 },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 18 },  // Guia
          1: { cellWidth: 30 },  // Médico
          2: { cellWidth: 28 },  // Plano
          3: { cellWidth: 18 },  // Data
          4: { cellWidth: 22 },  // Valor
          5: { cellWidth: 20 },  // Glosa
          6: { cellWidth: 22 },  // Líquido
          7: { cellWidth: 20 }   // Status
        }
      });

    } else if (tipoRelatorio === 'medico') {
      // Tabela de estatísticas por médico
      const medicosData = estatisticasPorMedico.map(m => [
        m.nome,
        m.totalHonorarios.toString(),
        m.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        m.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        m.valorGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        `${m.taxaGlosa.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Médico', 'Qtd', 'Total', 'Pago', 'Glosado', 'Taxa Glosa']],
        body: medicosData,
        theme: 'grid',
        headStyles: { fillColor: [40, 167, 69], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 }
      });

    } else if (tipoRelatorio === 'plano') {
      // Tabela de estatísticas por plano
      const planosData = estatisticasPorPlano.map(p => [
        p.nome,
        p.totalHonorarios.toString(),
        p.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        p.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        p.valorGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        `${p.taxaGlosa.toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Plano de Saúde', 'Qtd', 'Total', 'Pago', 'Glosado', 'Taxa Glosa']],
        body: planosData,
        theme: 'grid',
        headStyles: { fillColor: [23, 162, 184], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 }
      });

    } else if (tipoRelatorio === 'glosas') {
      // Resumo de glosas
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Estatísticas de Glosas', margemEsquerda, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Glosas: ${estatisticasGlosas.totalGlosas}`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Valor Total Glosado: ${estatisticasGlosas.totalGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Taxa Média de Glosa: ${estatisticasGlosas.taxaGlosa.toFixed(1)}%`, margemEsquerda, yPosition);
      yPosition += 10;

      // Tabela de glosas por motivo
      const glosasData = estatisticasGlosas.porMotivo.map(g => [
        g.motivo,
        g.count.toString(),
        g.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        `${((g.valor / estatisticasGlosas.totalGlosado) * 100).toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Motivo', 'Quantidade', 'Valor', '% do Total']],
        body: glosasData,
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 }
      });

    } else if (tipoRelatorio === 'tempo-pagamento') {
      // Resumo tempo de pagamento
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Análise de Tempo de Pagamento', margemEsquerda, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tempo Médio Geral: ${analiseTempoMensal.tempoMedioGeral} dias`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Total de Consultas Pagas: ${analiseTempoMensal.totalConsultasPagas}`, margemEsquerda, yPosition);
      yPosition += 6;
      doc.text(`Meta: 30 dias`, margemEsquerda, yPosition);
      yPosition += 6;
      const statusMeta = analiseTempoMensal.tempoMedioGeral <= 30 ? '✓ Meta atingida!' : '✗ Acima da meta';
      doc.text(`Status: ${statusMeta}`, margemEsquerda, yPosition);
      yPosition += 10;

      // Tabela mensal
      const tempoData = analiseTempoMensal.estatisticasMensais.map(e => [
        e.nomeMes,
        e.quantidadeConsultas.toString(),
        `${e.tempoMedioDias} dias`,
        e.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        e.tempoMedioDias <= 30 ? 'Excelente' : e.tempoMedioDias <= 45 ? 'Atenção' : 'Crítico'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Mês/Ano', 'Consultas', 'Tempo Médio', 'Valor Total', 'Status']],
        body: tempoData,
        theme: 'grid',
        headStyles: { fillColor: [255, 193, 7], textColor: 0 },
        styles: { fontSize: 8, cellPadding: 2 }
      });
    }

    // Rodapé
    const totalPaginas = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150);
      doc.text(
        `Sistema de Gerenciamento de Honorários Médicos - SGHM © 2025`,
        105,
        285,
        { align: 'center' }
      );
      doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, { align: 'center' });
    }

    // Salvar PDF
    const nomeArquivo = `relatorio_${tipoRelatorio}_${new Date().getTime()}.pdf`;
    doc.save(nomeArquivo);
  };

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <div>
          <h1>Relatórios Avançados</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            Análises detalhadas de honorários e desempenho financeiro
          </p>
        </div>
      </div>

      {/* Seletor de Tipo de Relatório */}
      <div className="report-type-selector no-print" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <button
          className={`report-type-card ${tipoRelatorio === 'geral' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('geral')}
          data-testid="btn-relatorio-geral"
          style={{
            padding: '20px',
            border: tipoRelatorio === 'geral' ? '2px solid var(--primary-color)' : '2px solid #e1e5e9',
            borderRadius: '8px',
            background: tipoRelatorio === 'geral' ? 'rgba(0, 123, 255, 0.05)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <FaChartBar size={24} style={{ color: 'var(--primary-color)', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 5px 0' }}>Relatório Geral</h4>
          <small style={{ color: '#6c757d' }}>Visão consolidada</small>
        </button>

        <button
          className={`report-type-card ${tipoRelatorio === 'medico' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('medico')}
          data-testid="btn-relatorio-medico"
          style={{
            padding: '20px',
            border: tipoRelatorio === 'medico' ? '2px solid var(--primary-color)' : '2px solid #e1e5e9',
            borderRadius: '8px',
            background: tipoRelatorio === 'medico' ? 'rgba(0, 123, 255, 0.05)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <FaUserMd size={24} style={{ color: '#28a745', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 5px 0' }}>Por Médico</h4>
          <small style={{ color: '#6c757d' }}>Análise individual</small>
        </button>

        <button
          className={`report-type-card ${tipoRelatorio === 'plano' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('plano')}
          data-testid="btn-relatorio-plano"
          style={{
            padding: '20px',
            border: tipoRelatorio === 'plano' ? '2px solid var(--primary-color)' : '2px solid #e1e5e9',
            borderRadius: '8px',
            background: tipoRelatorio === 'plano' ? 'rgba(0, 123, 255, 0.05)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <FaHospital size={24} style={{ color: '#17a2b8', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 5px 0' }}>Por Plano</h4>
          <small style={{ color: '#6c757d' }}>Desempenho dos planos</small>
        </button>

        <button
          className={`report-type-card ${tipoRelatorio === 'glosas' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('glosas')}
          data-testid="btn-relatorio-glosas"
          style={{
            padding: '20px',
            border: tipoRelatorio === 'glosas' ? '2px solid var(--primary-color)' : '2px solid #e1e5e9',
            borderRadius: '8px',
            background: tipoRelatorio === 'glosas' ? 'rgba(0, 123, 255, 0.05)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <FaBan size={24} style={{ color: '#dc3545', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 5px 0' }}>Glosas</h4>
          <small style={{ color: '#6c757d' }}>Análise de glosas</small>
        </button>

        <button
          className={`report-type-card ${tipoRelatorio === 'tempo-pagamento' ? 'active' : ''}`}
          onClick={() => setTipoRelatorio('tempo-pagamento')}
          data-testid="btn-relatorio-tempo"
          style={{
            padding: '20px',
            border: tipoRelatorio === 'tempo-pagamento' ? '2px solid var(--primary-color)' : '2px solid #e1e5e9',
            borderRadius: '8px',
            background: tipoRelatorio === 'tempo-pagamento' ? 'rgba(0, 123, 255, 0.05)' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <FaCalendarAlt size={24} style={{ color: '#ffc107', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 5px 0' }}>Tempo de Pagamento</h4>
          <small style={{ color: '#6c757d' }}>Análise temporal</small>
        </button>
      </div>

      {/* Seção de Filtros */}
      <div className="filter-container no-print">
        <div className="form-group">
          <label htmlFor="filtroMedico">Médico</label>
          <select id="filtroMedico" value={filtroMedico} onChange={e => setFiltroMedico(Number(e.target.value))} data-testid="select-filtro-medico">
            <option value={0}>Todos os Médicos</option>
            {medicos.map((m: Medico) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="filtroPlano">Plano de Saúde</label>
          <select id="filtroPlano" value={filtroPlano} onChange={e => setFiltroPlano(Number(e.target.value))} data-testid="select-filtro-plano">
            <option value={0}>Todos os Planos</option>
            {planosSaude.map((p: PlanoSaude) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="filtroDataInicio">De:</label>
          <input type="date" id="filtroDataInicio" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} data-testid="input-data-inicio" />
        </div>
        <div className="form-group">
          <label htmlFor="filtroDataFim">Até:</label>
          <input type="date" id="filtroDataFim" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} data-testid="input-data-fim" />
        </div>
        <button className="btn btn-primary" onClick={handleGenerateReport} data-testid="btn-gerar-relatorio">
          <FaChartBar /> Gerar Relatório
        </button>
      </div>

      {/* Conteúdo do Relatório */}
      {showReport && (
        <div className="report-content" id="report-to-print">
          <div className="report-header">
            <h2>
              {tipoRelatorio === 'geral' && '📊 Relatório Geral de Honorários'}
              {tipoRelatorio === 'medico' && '👨‍⚕️ Relatório por Médico'}
              {tipoRelatorio === 'plano' && '🏥 Relatório por Plano de Saúde'}
              {tipoRelatorio === 'glosas' && '❌ Relatório de Glosas'}
              {tipoRelatorio === 'tempo-pagamento' && '📅 Relatório de Tempo Médio de Pagamento'}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <div>
                <p style={{ margin: '5px 0' }}>
                  <strong>Médico:</strong> {filtroMedico === 0 ? 'Todos' : getMedicoNome(filtroMedico)}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Plano:</strong> {filtroPlano === 0 ? 'Todos' : getPlanoNome(filtroPlano)}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Período:</strong> {filtroDataInicio ? new Date(filtroDataInicio).toLocaleDateString('pt-BR') : 'Início'} a {filtroDataFim ? new Date(filtroDataFim).toLocaleDateString('pt-BR') : 'Hoje'}
                </p>
              </div>
              <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handlePrint} data-testid="btn-imprimir">
                  <FaPrint /> Imprimir
                </button>
                <button className="btn btn-primary" onClick={handleExportPDF} data-testid="btn-exportar-pdf">
                  <FaFileDownload /> Exportar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Relatório Geral */}
          {tipoRelatorio === 'geral' && (
            <>
              {/* Cards de Resumo */}
              <div className="summary-cards">
                <div className="summary-card" style={{ borderColor: '#007bff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaCheckCircle style={{ color: '#007bff' }} />
                    <span>Total Processado</span>
                  </div>
                  <strong>{resumoGeral.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    {resumoGeral.totalHonorarios} honorários
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#28a745' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaCheckCircle style={{ color: '#28a745' }} />
                    <span>Pago</span>
                  </div>
                  <strong>{resumoGeral.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    {resumoGeral.valorTotal > 0 ? `${((resumoGeral.valorPago / resumoGeral.valorTotal) * 100).toFixed(1)}%` : '0%'} do total
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#17a2b8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaClock style={{ color: '#17a2b8' }} />
                    <span>Enviado</span>
                  </div>
                  <strong>{resumoGeral.valorEnviado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    Aguardando retorno
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#ffc107' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaClock style={{ color: '#ffc107' }} />
                    <span>Pendente</span>
                  </div>
                  <strong>{resumoGeral.valorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    A enviar
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#dc3545' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaBan style={{ color: '#dc3545' }} />
                    <span>Glosado</span>
                  </div>
                  <strong>{resumoGeral.valorGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    Taxa: {resumoGeral.taxaGlosa.toFixed(1)}%
                  </small>
                </div>
              </div>

              {/* Tabela de Honorários */}
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Detalhamento de Honorários</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Guia</th>
                      <th>Médico</th>
                      <th>Plano</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Glosa</th>
                      <th>Líquido</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {honorariosFiltrados.map((honorario) => (
                      <tr key={honorario.id}>
                        <td>{honorario.numeroGuia || '-'}</td>
                        <td>{getMedicoNome(honorario.medicoId)}</td>
                        <td>{getPlanoNome(honorario.planoSaudeId)}</td>
                        <td>{new Date(honorario.dataConsulta).toLocaleDateString('pt-BR')}</td>
                        <td>{(honorario.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ color: honorario.valorGlosa ? '#dc3545' : '#6c757d' }}>
                          {honorario.valorGlosa ? honorario.valorGlosa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {calcularValorLiquido(honorario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td>
                          <span className={`status-badge status-${honorario.status.toLowerCase()}`}>
                            {honorario.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {honorariosFiltrados.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Nenhum honorário encontrado para os filtros selecionados.</p>
                )}
              </div>
            </>
          )}

          {/* Relatório por Médico */}
          {tipoRelatorio === 'medico' && (
            <>
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Desempenho por Médico</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Médico</th>
                      <th>Qtd. Honorários</th>
                      <th>Valor Total</th>
                      <th>Valor Pago</th>
                      <th>Valor Glosado</th>
                      <th>Taxa de Glosa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estatisticasPorMedico.map((stat, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{stat.nome}</td>
                        <td style={{ textAlign: 'center' }}>{stat.totalHonorarios}</td>
                        <td>{stat.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ color: '#28a745' }}>{stat.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ color: '#dc3545' }}>{stat.valorGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: stat.taxaGlosa > 15 ? '#ffebee' : '#e8f5e9',
                            color: stat.taxaGlosa > 15 ? '#c62828' : '#2e7d32',
                            fontWeight: 600
                          }}>
                            {stat.taxaGlosa.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {estatisticasPorMedico.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Nenhum dado encontrado.</p>
                )}
              </div>
            </>
          )}

          {/* Relatório por Plano */}
          {tipoRelatorio === 'plano' && (
            <>
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Desempenho por Plano de Saúde</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Plano de Saúde</th>
                      <th>Qtd. Honorários</th>
                      <th>Valor Total</th>
                      <th>Valor Pago</th>
                      <th>Valor Pendente</th>
                      <th>Valor Glosado</th>
                      <th>Taxa de Glosa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estatisticasPorPlano.map((stat, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{stat.nome}</td>
                        <td style={{ textAlign: 'center' }}>{stat.totalHonorarios}</td>
                        <td>{stat.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ color: '#28a745' }}>{stat.valorPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ color: '#ffc107' }}>{stat.valorPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ color: '#dc3545' }}>{stat.valorGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: stat.taxaGlosa > 15 ? '#ffebee' : '#e8f5e9',
                            color: stat.taxaGlosa > 15 ? '#c62828' : '#2e7d32',
                            fontWeight: 600
                          }}>
                            {stat.taxaGlosa.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {estatisticasPorPlano.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Nenhum dado encontrado.</p>
                )}
              </div>
            </>
          )}

          {/* Relatório de Glosas */}
          {tipoRelatorio === 'glosas' && (
            <>
              {/* Cards de Resumo de Glosas */}
              <div className="summary-cards">
                <div className="summary-card" style={{ borderColor: '#dc3545' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaBan style={{ color: '#dc3545' }} />
                    <span>Total de Glosas</span>
                  </div>
                  <strong>{estatisticasGlosas.totalGlosas}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    Honorários glosados
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#dc3545' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaBan style={{ color: '#dc3545' }} />
                    <span>Valor Glosado</span>
                  </div>
                  <strong>{estatisticasGlosas.totalGlosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    Perda total
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#ffc107' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaChartBar style={{ color: '#ffc107' }} />
                    <span>Taxa de Glosa</span>
                  </div>
                  <strong>{estatisticasGlosas.taxaGlosa.toFixed(1)}%</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    {estatisticasGlosas.taxaGlosa > 15 ? '⚠️ Acima do ideal' : '✓ Dentro do esperado'}
                  </small>
                </div>
              </div>

              {/* Glosas por Motivo */}
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Glosas por Motivo</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Motivo</th>
                      <th>Quantidade</th>
                      <th>Valor Total</th>
                      <th>% do Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estatisticasGlosas.porMotivo.map((item, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 500 }}>{item.motivo}</td>
                        <td style={{ textAlign: 'center' }}>{item.count}</td>
                        <td style={{ color: '#dc3545', fontWeight: 600 }}>
                          {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              flex: 1,
                              height: '20px',
                              background: '#f5f5f5',
                              borderRadius: '10px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${(item.valor / estatisticasGlosas.totalGlosado * 100)}%`,
                                height: '100%',
                                background: '#dc3545',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                            <span style={{ fontWeight: 600, minWidth: '50px' }}>
                              {((item.valor / estatisticasGlosas.totalGlosado) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {estatisticasGlosas.porMotivo.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Nenhuma glosa encontrada.</p>
                )}
              </div>

              {/* Recomendações */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 Recomendações para Reduzir Glosas</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                  <li>Revise a documentação antes do envio</li>
                  <li>Verifique se todos os códigos de procedimento estão corretos</li>
                  <li>Confirme que as autorizações estão anexadas</li>
                  <li>Treine a equipe sobre os motivos mais comuns de glosa</li>
                  <li>Mantenha comunicação regular com os planos de saúde</li>
                </ul>
              </div>
            </>
          )}

          {/* Relatório de Tempo de Pagamento */}
          {tipoRelatorio === 'tempo-pagamento' && (
            <>
              {/* Card de Resumo Geral */}
              <div className="summary-cards" style={{ marginBottom: '30px' }}>
                <div className="summary-card" style={{ borderColor: '#ffc107' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaCalendarAlt style={{ color: '#ffc107' }} />
                    <span>Tempo Médio Geral</span>
                  </div>
                  <strong style={{ fontSize: '2rem' }}>{analiseTempoMensal.tempoMedioGeral} dias</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    Da consulta ao recebimento
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#28a745' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaCheckCircle style={{ color: '#28a745' }} />
                    <span>Total Consultas Pagas</span>
                  </div>
                  <strong style={{ fontSize: '2rem' }}>{analiseTempoMensal.totalConsultasPagas}</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    Com data de recebimento
                  </small>
                </div>
                <div className="summary-card" style={{ borderColor: '#007bff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FaChartBar style={{ color: '#007bff' }} />
                    <span>Meta Estabelecida</span>
                  </div>
                  <strong style={{ fontSize: '2rem' }}>30 dias</strong>
                  <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                    {analiseTempoMensal.tempoMedioGeral <= 30 ? '✅ Meta atingida!' : '⚠️ Acima da meta'}
                  </small>
                </div>
              </div>

              {/* Análise Mensal */}
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>📅 Histórico Mensal de Tempo de Pagamento</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Mês/Ano</th>
                      <th style={{ textAlign: 'center' }}>Consultas Pagas</th>
                      <th style={{ textAlign: 'center' }}>Tempo Médio (dias)</th>
                      <th style={{ textAlign: 'right' }}>Valor Total</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analiseTempoMensal.estatisticasMensais.map((item, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600 }}>{item.nomeMes}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantidadeConsultas}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            background: item.tempoMedioDias <= 30 ? '#d4edda' : item.tempoMedioDias <= 45 ? '#fff3cd' : '#f8d7da',
                            color: item.tempoMedioDias <= 30 ? '#155724' : item.tempoMedioDias <= 45 ? '#856404' : '#721c24'
                          }}>
                            {item.tempoMedioDias} dias
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {item.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {item.tempoMedioDias <= 30 ? (
                            <span style={{ color: '#28a745' }}>✅ Excelente</span>
                          ) : item.tempoMedioDias <= 45 ? (
                            <span style={{ color: '#ffc107' }}>⚠️ Atenção</span>
                          ) : (
                            <span style={{ color: '#dc3545' }}>❌ Crítico</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {analiseTempoMensal.estatisticasMensais.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                    Nenhuma consulta paga com data de recebimento encontrada no período selecionado.
                  </p>
                )}
              </div>

              {/* Análise e Recomendações */}
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#e7f3ff',
                border: '1px solid #007bff',
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#004085' }}>📊 Análise de Desempenho</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#004085' }}>Fatores que Influenciam o Tempo:</h5>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#004085' }}>
                      <li>Tipo de plano de saúde (particular paga mais rápido)</li>
                      <li>Complexidade da documentação</li>
                      <li>Prazo contratual com cada convênio</li>
                      <li>Eficiência no envio das guias</li>
                      <li>Taxa de glosa (retrabalho aumenta o tempo)</li>
                    </ul>
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#004085' }}>Recomendações para Reduzir o Tempo:</h5>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#004085' }}>
                      <li>Enviar documentação completa na primeira submissão</li>
                      <li>Fazer follow-up regular com os convênios</li>
                      <li>Automatizar o processo de envio de guias</li>
                      <li>Negociar prazos menores nos contratos</li>
                      <li>Priorizar convênios com melhor histórico de pagamento</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Meta de Implantação */}
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: analiseTempoMensal.tempoMedioGeral <= 30 ? '#d4edda' : '#fff3cd',
                border: `1px solid ${analiseTempoMensal.tempoMedioGeral <= 30 ? '#28a745' : '#ffc107'}`,
                borderRadius: '8px'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: analiseTempoMensal.tempoMedioGeral <= 30 ? '#155724' : '#856404' }}>
                  🎯 Meta do Plano de Implantação
                </h4>
                <p style={{ margin: 0, color: analiseTempoMensal.tempoMedioGeral <= 30 ? '#155724' : '#856404' }}>
                  <strong>Objetivo:</strong> Reduzir o tempo médio de pagamento de 45 dias para 30 dias.
                  <br />
                  <strong>Status Atual:</strong> {analiseTempoMensal.tempoMedioGeral} dias {' '}
                  {analiseTempoMensal.tempoMedioGeral <= 30 ? (
                    <span style={{ fontWeight: 'bold' }}>✅ META ALCANÇADA!</span>
                  ) : (
                    <span>
                      (Redução necessária: {analiseTempoMensal.tempoMedioGeral - 30} dias)
                    </span>
                  )}
                </p>
              </div>
            </>
          )}

          <div className="report-footer">
            <p>Relatório gerado em: {new Date().toLocaleString('pt-BR')}</p>
            <p style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '5px' }}>
              Sistema de Gerenciamento de Honorários Médicos - SGHM © 2025
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;