import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext'; // 1. Importar o hook useData
import { Consulta, Medico, Paciente } from '../data/mockData'; // 2. Importar TIPOS
import './RegistroConsultas.css'; // Reutiliza os estilos de status-badge
import './ControleFinanceiro.css'; // Estilos próprios

type StatusConsulta = Consulta['status'];

const ControleFinanceiro: React.FC = () => {
  // 3. Obter dados do Contexto
  const { consultas, medicos, pacientes } = useData();

  // Estados para os filtros
  const [filtroMedico, setFiltroMedico] = useState<number>(0);
  const [filtroStatus, setFiltroStatus] = useState<StatusConsulta | ''>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');

  // 4. Funções de busca usam dados do Contexto
  const getPacienteNome = (id: number) => pacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => medicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';

  // 5. Lógica de filtragem usa dados do Contexto
  const consultasFiltradas = useMemo(() => {
    return consultas.filter(consulta => {
      // Filtro de Médico
      if (filtroMedico !== 0 && consulta.medicoId !== filtroMedico) {
        return false;
      }
      // Filtro de Status
      if (filtroStatus !== '' && consulta.status !== filtroStatus) {
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
  }, [consultas, filtroMedico, filtroStatus, filtroDataInicio, filtroDataFim]); // Depende de 'consultas'

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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Controle Financeiro</h1>
      </div>

      {/* Seção de Filtros */}
      <div className="filter-container">
        <div className="form-group">
          <label htmlFor="filtroMedico">Médico</label>
          <select id="filtroMedico" value={filtroMedico} onChange={e => setFiltroMedico(Number(e.target.value))}>
            <option value={0}>Todos os Médicos</option>
            {/* 6. Mapear dados do Contexto */}
            {medicos.map((m: Medico) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="filtroStatus">Status</label>
          <select id="filtroStatus" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusConsulta | '')}>
            <option value="">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Glosado">Glosado</option>
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
            {/* 7. Mapear dados do Contexto */}
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
      </div>
    </div>
  );
};

export default ControleFinanceiro;