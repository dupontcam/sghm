import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Consulta, Medico, Paciente, Honorario, PlanoSaude } from '../data/mockData';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaBan } from 'react-icons/fa';
import './RegistroConsultas.css';
import './ControleFinanceiro.css';

type StatusConsulta = Consulta['status'];

const ControleFinanceiro: React.FC = () => {
  const { consultas, medicos, pacientes, honorarios, planosSaude } = useData();

  // Estados para os filtros
  const [filtroMedico, setFiltroMedico] = useState<number>(0);
  const [filtroPlano, setFiltroPlano] = useState<number>(0);
  const [filtroStatus, setFiltroStatus] = useState<StatusConsulta | ''>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  const [exibirHonorarios, setExibirHonorarios] = useState(true);

  const getPacienteNome = (id: number) => pacientes.find((p: Paciente) => p.id === id)?.nome || 'Não encontrado';
  const getMedicoNome = (id: number) => medicos.find((m: Medico) => m.id === id)?.nome || 'Não encontrado';
  const getPlanoNome = (id: number | null | undefined) => {
    if (!id) return 'Particular';
    return planosSaude.find((p: PlanoSaude) => p.id === id)?.nome || 'Não encontrado';
  };

  const consultasFiltradas = useMemo(() => {
    return consultas.filter(consulta => {
      if (filtroMedico !== 0 && consulta.medicoId !== filtroMedico) return false;
      if (filtroPlano !== 0 && consulta.planoSaudeId !== filtroPlano) return false;
      if (filtroStatus !== '' && consulta.status !== filtroStatus) return false;
      if (filtroDataInicio && new Date(consulta.dataConsulta) < new Date(filtroDataInicio)) return false;
      if (filtroDataFim && new Date(consulta.dataConsulta) > new Date(filtroDataFim)) return false;
      return true;
    });
  }, [consultas, filtroMedico, filtroPlano, filtroStatus, filtroDataInicio, filtroDataFim]);

  const honorariosFiltrados = useMemo(() => {
    if (!exibirHonorarios) return [];

    return honorarios.filter(honorario => {
      if (filtroMedico !== 0 && honorario.medicoId !== filtroMedico) return false;
      if (filtroPlano !== 0 && honorario.planoSaudeId !== filtroPlano) return false;
      if (filtroDataInicio && new Date(honorario.dataConsulta) < new Date(filtroDataInicio)) return false;
      if (filtroDataFim && new Date(honorario.dataConsulta) > new Date(filtroDataFim)) return false;
      return true;
    });
  }, [honorarios, filtroMedico, filtroPlano, filtroDataInicio, filtroDataFim, exibirHonorarios]);

  const resumoFinanceiro = useMemo(() => {
    let faturado = 0;
    let pago = 0;
    let glosado = 0;
    let aReceber = 0;
    let enviado = 0;

    consultasFiltradas.forEach(c => {
      faturado += c.valorProcedimento;
      if (c.status === 'Pago') pago += c.valorProcedimento;
      else if (c.status === 'Glosado') glosado += c.valorProcedimento;
      else if (c.status === 'Pendente') aReceber += c.valorProcedimento;
    });

    if (exibirHonorarios) {
      honorariosFiltrados.forEach(h => {
        const valor = h.valor || 0;
        faturado += valor;

        if (h.status === 'PAGO') pago += valor;
        else if (h.status === 'GLOSADO') glosado += valor;
        else if (h.status === 'PENDENTE') aReceber += valor;
        else if (h.status === 'ENVIADO') enviado += valor;
      });
    }

    return { faturado, pago, glosado, aReceber, enviado };
  }, [consultasFiltradas, honorariosFiltrados, exibirHonorarios]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Controle Financeiro</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            Visão consolidada de consultas e honorários médicos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={exibirHonorarios}
              onChange={(e) => setExibirHonorarios(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
              data-testid="toggle-exibir-honorarios"
            />
            <span style={{ fontWeight: 500 }}>Incluir Honorários</span>
          </label>
        </div>
      </div>

      <div className="filter-container">
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
          <label htmlFor="filtroStatus">Status</label>
          <select id="filtroStatus" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusConsulta | '')} data-testid="select-filtro-status">
            <option value="">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Glosado">Glosado</option>
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
      </div>

      <div className="summary-cards">
        <div className="summary-card" style={{ borderColor: '#007bff' }} data-testid="card-total-faturado">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaCheckCircle style={{ color: '#007bff' }} />
            <span>Total Faturado</span>
          </div>
          <strong>{resumoFinanceiro.faturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
            Consultas e honorários
          </small>
        </div>
        <div className="summary-card" style={{ borderColor: '#28a745' }} data-testid="card-total-pago">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaCheckCircle style={{ color: '#28a745' }} />
            <span>Total Pago</span>
          </div>
          <strong>{resumoFinanceiro.pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
            Valores recebidos
          </small>
        </div>
        <div className="summary-card" style={{ borderColor: '#17a2b8' }} data-testid="card-enviado">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaClock style={{ color: '#17a2b8' }} />
            <span>Enviado</span>
          </div>
          <strong>{resumoFinanceiro.enviado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
            Aguardando pagamento
          </small>
        </div>
        <div className="summary-card" style={{ borderColor: '#ffc107' }} data-testid="card-a-receber">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaClock style={{ color: '#ffc107' }} />
            <span>A Receber</span>
          </div>
          <strong>{resumoFinanceiro.aReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
            Pendente de envio
          </small>
        </div>
        <div className="summary-card" style={{ borderColor: '#dc3545' }} data-testid="card-glosado">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FaBan style={{ color: '#dc3545' }} />
            <span>Glosado</span>
          </div>
          <strong>{resumoFinanceiro.glosado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
          <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
            {resumoFinanceiro.faturado > 0
              ? `${((resumoFinanceiro.glosado / resumoFinanceiro.faturado) * 100).toFixed(1)}% do total`
              : '0% do total'}
          </small>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>
          Consultas ({consultasFiltradas.length})
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Protocolo</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Data</th>
                <th>Plano</th>
                <th>Valor (R$)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas.map((consulta) => (
                <tr key={`consulta-${consulta.id}`} data-testid={`row-consulta-${consulta.id}`}>
                  <td><span style={{
                    background: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>CONSULTA</span></td>
                  <td>{consulta.protocolo}</td>
                  <td>{getPacienteNome(consulta.pacienteId)}</td>
                  <td>{getMedicoNome(consulta.medicoId)}</td>
                  <td>{new Date(consulta.dataConsulta).toLocaleDateString('pt-BR')}</td>
                  <td>{getPlanoNome(consulta.planoSaudeId)}</td>
                  <td style={{ fontWeight: 600 }}>{consulta.valorProcedimento.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</td>
                  <td>
                    <span className={`status-badge status-${consulta.status.toLowerCase()}`}>
                      {consulta.status}
                    </span>
                  </td>
                </tr>
              ))}
              {consultasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                    Nenhuma consulta encontrada com os filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {exibirHonorarios && (
        <div>
          <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>
            Honorários ({honorariosFiltrados.length})
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Guia</th>
                  <th>Médico</th>
                  <th>Plano de Saúde</th>
                  <th>Data</th>
                  <th>Valor (R$)</th>
                  <th>Glosa (R$)</th>
                  <th>Líquido (R$)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {honorariosFiltrados.map((honorario) => (
                  <tr key={`honorario-${honorario.id}`} data-testid={`row-honorario-${honorario.id}`}>
                    <td><span style={{
                      background: '#f3e5f5',
                      color: '#7b1fa2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>HONORÁRIO</span></td>
                    <td>{honorario.numeroGuia || '-'}</td>
                    <td>{getMedicoNome(honorario.medicoId)}</td>
                    <td>{getPlanoNome(honorario.planoSaudeId)}</td>
                    <td>{new Date(honorario.dataConsulta).toLocaleDateString('pt-BR')}</td>
                    <td style={{ fontWeight: 600 }}>{(honorario.valor || 0).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</td>
                    <td style={{ color: honorario.valorGlosa ? '#dc3545' : '#6c757d' }}>
                      {honorario.valorGlosa ? honorario.valorGlosa.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }) : '-'}
                    </td>
                    <td style={{ fontWeight: 600, color: '#28a745' }}>
                      {((honorario.valor || 0) - (honorario.valorGlosa || 0)).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td>
                      <span className={`status-badge status-${honorario.status.toLowerCase()}`}>
                        {honorario.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {honorariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                      Nenhum honorário encontrado com os filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControleFinanceiro;