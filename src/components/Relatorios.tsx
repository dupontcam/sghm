import React, { useState, useMemo } from 'react';
import { mockConsultas, Consulta } from './RegistroConsultas';
import { mockMedicos, Medico } from './CadastroMedicos';
import { mockPacientes, Paciente } from './CadastroPacientes';
import './RegistroConsultas.css'; // Reutiliza os estilos de status-badge
import './ControleFinanceiro.css'; // Reutiliza os estilos dos cards e filtros
import './Relatorios.css'; // Estilos próprios para impressão

// Lógica para encontrar nomes
const getPacienteNome = (id: number) => mockPacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
const getMedicoNome = (id: number) => mockMedicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';

const Relatorios: React.FC = () => {
  // Estados para os filtros
  const [filtroMedico, setFiltroMedico] = useState<number>(0); // 0 = Todos
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  
  // Estado para controlar a exibição do relatório
  const [showReport, setShowReport] = useState(false);

  // Lógica de filtragem
  const consultasFiltradas = useMemo(() => {
    // Só filtra se showReport for true
    if (!showReport) return [];

    return mockConsultas.filter(consulta => {
      // Filtro de Médico
      if (filtroMedico !== 0 && consulta.medicoId !== filtroMedico) {
        return false;
      }
      // Filtro de Data Início
      if (filtroDataInicio && new Date(consulta.dataConsulta) < new Date(filtroDataInicio)) {
        return false;
      }
      // Filtro de Data Fim
      if (filtroDataFim && new Date(consulta.dataConsulta) > new Date(filtroDataFim)) {
        return false;
      }
      return true;
    });
  }, [filtroMedico, filtroDataInicio, filtroDataFim, showReport]);

  // Lógica para os cards de resumo
  const resumoFinanceiro = useMemo(() => {
    let faturado = 0;
    let pago = 0;
    let glosado = 0;
    let aReceber = 0;

    consultasFiltradas.forEach(c => {
      faturado += c.valorProcedimento;
      if (c.status === 'Pago') {
        pago += c.valorProcedimento;
      } else if (c.status === 'Glosado') {
        glosado += c.valorProcedimento;
      } else if (c.status === 'Pendente') {
        aReceber += c.valorProcedimento;
      }
    });

    return { faturado, pago, glosado, aReceber };
  }, [consultasFiltradas]);

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  // Aciona a impressão do navegador
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container">
      <div className="page-header no-print">
        <h1>Relatórios Financeiros</h1>
      </div>

      {/* Seção de Filtros (escondida na impressão) */}
      <div className="filter-container no-print">
        <div className="form-group">
          <label htmlFor="filtroMedico">Médico</label>
          <select id="filtroMedico" value={filtroMedico} onChange={e => setFiltroMedico(Number(e.target.value))}>
            <option value={0}>Todos os Médicos</option>
            {mockMedicos.map((m: Medico) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="filtroDataInicio">De:</label>
          <input type="date" id="filtroDataInicio" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="filtroDataFim">Até:</label>
          <input type="date" id="filtroDataFim" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleGenerateReport}>
          Gerar Relatório
        </button>
      </div>

      {/* Conteúdo do Relatório (visível apenas após gerar e na impressão) */}
      {showReport && (
        <div className="report-content" id="report-to-print">
          <div className="report-header">
            <h2>Relatório Financeiro</h2>
            <p>
              <strong>Médico:</strong> {filtroMedico === 0 ? 'Todos' : getMedicoNome(filtroMedico)} <br />
              <strong>Período:</strong> {filtroDataInicio ? new Date(filtroDataInicio).toLocaleDateString() : 'N/A'} a {filtroDataFim ? new Date(filtroDataFim).toLocaleDateString() : 'N/A'}
            </p>
            <button className="btn btn-secondary no-print" onClick={handlePrint} style={{float: 'right'}}>
              Imprimir Relatório
            </button>
          </div>

          {/* Seção de Cards de Resumo */}
          <div className="summary-cards">
            <div className="summary-card" style={{ borderColor: '#007bff' }}>
              <span>Total Faturado</span>
              <strong>{resumoFinanceiro.faturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div className="summary-card" style={{ borderColor: '#28a745' }}>
              <span>Total Pago</span>
              <strong>{resumoFinanceiro.pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div className="summary-card" style={{ borderColor: '#dc3545' }}>
              <span>Total Glosado</span>
              <strong>{resumoFinanceiro.glosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
            <div className="summary-card" style={{ borderColor: '#ffc107' }}>
              <span>Total a Receber</span>
              <strong>{resumoFinanceiro.aReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
          </div>

          {/* Tabela de Dados */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Data</th>
                  <th>Tipo Pag.</th>
                  <th>Valor (R$)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {consultasFiltradas.map((consulta) => (
                  <tr key={consulta.id}>
                    <td>{consulta.protocolo}</td>
                    <td>{getPacienteNome(consulta.pacienteId)}</td>
                    <td>{getMedicoNome(consulta.medicoId)}</td>
                    <td>{new Date(consulta.dataConsulta).toLocaleDateString()}</td>
                    <td>{consulta.tipoPagamento}</td>
                    <td>{consulta.valorProcedimento.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${consulta.status.toLowerCase()}`}>
                        {consulta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {consultasFiltradas.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>Nenhum dado encontrado para os filtros selecionados.</p>}
          </div>

          <div className="report-footer">
            <p>Relatório gerado em: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;