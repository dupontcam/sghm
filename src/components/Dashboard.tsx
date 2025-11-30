import React, { useMemo, useEffect, useState } from 'react';
import '../App.css'; // Estilos dos cards vêm do App.css
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { calcularTempoMedioPagamento } from '../data/mockData';
import { avaliacoesService } from '../services/avaliacoesService';
import { FaStar } from 'react-icons/fa';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    PieChart, Pie, Cell, Tooltip as PieTooltip,
    AreaChart, Area, LineChart, Line
} from 'recharts';

// --- Processamento de Dados para os Gráficos ---

const processPieData = (honorarios: any[]) => {
    const statusCounts: { [key: string]: number } = {
        PENDENTE: 0,
        ENVIADO: 0,
        PAGO: 0,
        GLOSADO: 0,
    };

    honorarios.forEach(honorario => {
        if (statusCounts.hasOwnProperty(honorario.status)) {
            statusCounts[honorario.status]++;
        }
    });

    return [
        { name: 'Pendente', value: statusCounts.PENDENTE },
        { name: 'Enviado', value: statusCounts.ENVIADO },
        { name: 'Pago', value: statusCounts.PAGO },
        { name: 'Glosado', value: statusCounts.GLOSADO },
    ].filter(entry => entry.value > 0);
};

const PIE_COLORS = {
    Pendente: '#ffc107', // Amarelo
    Enviado: '#17a2b8',  // Azul
    Pago: '#28a745',     // Verde
    Glosado: '#dc3545',  // Vermelho
};

// Dados por plano de saúde
const processPlanoData = (honorarios: any[], planosSaude: any[]) => {
    const planoStats: { [key: string]: { total: number, quantidade: number } } = {};

    honorarios.forEach(honorario => {
        const plano = planosSaude.find(p => p.id === honorario.planoSaudeId);
        if (plano) {
            if (!planoStats[plano.nome]) {
                planoStats[plano.nome] = { total: 0, quantidade: 0 };
            }
            planoStats[plano.nome].total += honorario.valor;
            planoStats[plano.nome].quantidade += 1;
        }
    });

    return Object.entries(planoStats).map(([nome, stats]) => ({
        name: nome,
        valor: stats.total,
        quantidade: stats.quantidade
    })).sort((a, b) => b.valor - a.valor);
};

// Tendência mensal (simulada)
const monthlyData = [
    { mes: 'Mai', valor: 820, glosado: 25 },
    { mes: 'Jun', valor: 950, glosado: 30 },
    { mes: 'Jul', valor: 1100, glosado: 45 },
    { mes: 'Ago', valor: 1050, glosado: 32 },
    { mes: 'Set', valor: 1240, glosado: 38 },
    { mes: 'Out', valor: 1180, glosado: 42 },
];

// --- Componente do Dashboard ---

const Dashboard: React.FC = () => {
    const { userProfile, user } = useAuth();
    const {
        consultas, honorarios, planosSaude, medicos,
        getDashboardStats
    } = useData();

    const [estatisticasSatisfacao, setEstatisticasSatisfacao] = useState<any>(null);

    const dashboardStats = getDashboardStats();
    const pieData = processPieData(honorarios);
    const planoData = processPlanoData(honorarios, planosSaude);
    const tempoMedioPagamento = calcularTempoMedioPagamento(consultas);

    // Carregar estatísticas de satisfação
    useEffect(() => {
        if (user) {
            avaliacoesService.initialize([
                { id: user.id, nome: user.nome, perfil: userProfile }
            ]);
        }
        const stats = avaliacoesService.getEstatisticasGerais();
        setEstatisticasSatisfacao(stats);
    }, [user, userProfile]);

    // Ranking de médicos por valor
    const rankingMedicos = useMemo(() => {
        const medicoStats: { [key: number]: { nome: string, total: number, quantidade: number } } = {};

        honorarios.forEach(honorario => {
            const medico = medicos.find(m => m.id === honorario.medicoId);
            if (medico) {
                if (!medicoStats[medico.id]) {
                    medicoStats[medico.id] = { nome: medico.nome, total: 0, quantidade: 0 };
                }
                medicoStats[medico.id].total += honorario.valor;
                medicoStats[medico.id].quantidade += 1;
            }
        });

        return Object.values(medicoStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [honorarios, medicos]);

    return (
        <div className="page-container">
            <div className="page-header">
                {userProfile === 'Admin' ? (
                    <h1>Dashboard Administrativo</h1>
                ) : (
                    <h1>Dashboard do Operador</h1>
                )}
                <p>Visão geral do sistema de honorários médicos</p>
            </div>

            {/* Cards de estatísticas principais */}
            <div className="stats-cards">
                <div className="card card-1" data-testid="card-total-processado">
                    <span>Total Processado</span>
                    <strong>R$ {dashboardStats.totalProcessado.toFixed(2)}</strong>
                    <small>{dashboardStats.quantidadeHonorarios} honorários</small>
                </div>

                {userProfile === 'Admin' && (
                    <>
                        <div className="card card-2" data-testid="card-taxa-glosa">
                            <span>Taxa de Glosa</span>
                            <strong>{dashboardStats.taxaGlosa.toFixed(2)}%</strong>
                            <small>R$ {dashboardStats.totalGlosado.toFixed(2)} glosado</small>
                        </div>

                        <div className="card card-3" data-testid="card-valores-pagos">
                            <span>Valores Pagos</span>
                            <strong>R$ {dashboardStats.totalPago.toFixed(2)}</strong>
                            <small>Confirmados</small>
                        </div>

                        <div className="card card-4" data-testid="card-tempo-medio">
                            <span>Tempo Médio Pagamento</span>
                            <strong>{tempoMedioPagamento} dias</strong>
                            <small>Da consulta ao recebimento</small>
                        </div>

                        <div className="card card-5" data-testid="card-pendente">
                            <span>Pendente</span>
                            <strong>R$ {dashboardStats.totalPendente.toFixed(2)}</strong>
                            <small>Aguardando processamento</small>
                        </div>
                    </>
                )}

                <div className="card card-info" data-testid="card-consultas-registradas">
                    <span>Consultas Registradas</span>
                    <strong>{consultas.length}</strong>
                    <small>Total no sistema</small>
                </div>
            </div>

            {/* Estatísticas resumidas */}
            <div className="summary-stats">
                <div className="summary-item" data-testid="summary-planos-ativos">
                    <h4>📋 Planos Ativos</h4>
                    <span>{planosSaude.filter(p => p.ativo).length}</span>
                </div>
                <div className="summary-item" data-testid="summary-medicos-cadastrados">
                    <h4>👨‍⚕️ Médicos Cadastrados</h4>
                    <span>{medicos.length}</span>
                </div>
                <div className="summary-item" data-testid="summary-media-honorario">
                    <h4>💰 Média por Honorário</h4>
                    <span>R$ {(dashboardStats.totalProcessado / Math.max(dashboardStats.quantidadeHonorarios, 1)).toFixed(2)}</span>
                </div>
            </div>

            {/* Gráficos para Admin */}
            {userProfile === 'Admin' && (
                <>
                    <div className="charts-container">

                        {/* Gráfico de Tendência */}
                        <div className="chart chart-large" data-testid="chart-tendencia">
                            <h4>Tendência de Honorários (6 meses)</h4>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={monthlyData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#007bff" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#007bff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="mes" fontSize={12} />
                                        <YAxis fontSize={12} tickFormatter={(value) => `R$${value}`} />
                                        <Tooltip formatter={(value) => `R$${(value as number).toLocaleString('pt-BR')}`} />
                                        <Area
                                            type="monotone"
                                            dataKey="valor"
                                            stroke="#007bff"
                                            fillOpacity={1}
                                            fill="url(#colorValor)"
                                            name="Valor Total"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="glosado"
                                            stroke="#dc3545"
                                            fill="#dc3545"
                                            fillOpacity={0.3}
                                            name="Glosado"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Gráfico de Pizza - Status */}
                        <div className="chart chart-small" data-testid="chart-status">
                            <h4>Status dos Honorários</h4>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label={(entry) => `${entry.name} (${entry.value})`}
                                        >
                                            {pieData.map((entry) => (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]}
                                                />
                                            ))}
                                        </Pie>
                                        <PieTooltip formatter={(value) => `${value} honorários`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico por Planos de Saúde */}
                    <div className="charts-container">
                        <div className="chart chart-large" data-testid="chart-planos">
                            <h4>Honorários por Plano de Saúde</h4>
                            <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <BarChart data={planoData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                        <XAxis
                                            dataKey="name"
                                            fontSize={11}
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis fontSize={12} tickFormatter={(value) => `R$${value}`} />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `R$${(value as number).toLocaleString('pt-BR')}`,
                                                name === 'valor' ? 'Valor Total' : 'Quantidade'
                                            ]}
                                        />
                                        <Legend />
                                        <Bar dataKey="valor" fill="#007bff" name="Valor Total" />
                                        <Bar dataKey="quantidade" fill="#28a745" name="Quantidade" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Ranking de Médicos */}
                        <div className="chart chart-small" data-testid="chart-ranking-medicos">
                            <h4>Top 5 Médicos (Valor)</h4>
                            <div className="ranking-list">
                                {rankingMedicos.map((medico, index) => (
                                    <div key={index} className="ranking-item">
                                        <div className="ranking-position">#{index + 1}</div>
                                        <div className="ranking-info">
                                            <div className="ranking-name">{medico.nome}</div>
                                            <div className="ranking-stats">
                                                <span>R$ {medico.total.toFixed(2)}</span>
                                                <small>({medico.quantidade} honorários)</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {rankingMedicos.length === 0 && (
                                    <div className="no-data">Nenhum dado disponível</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Seção de Satisfação */}
                    {estatisticasSatisfacao && (
                        <>
                            <div className="stats-cards" style={{ marginTop: '30px' }}>
                                <div className="card card-satisfacao">
                                    <span>Satisfação Média</span>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaStar style={{ color: '#ffc107', fontSize: '1.5rem' }} />
                                        {estatisticasSatisfacao.notaMedia.toFixed(1)}/5.0
                                    </strong>
                                    <small>{estatisticasSatisfacao.totalAvaliacoes} avaliações</small>
                                </div>
                            </div>

                            <div className="charts-container">
                                {/* Evolução Trimestral */}
                                <div className="chart chart-large" data-testid="chart-evolucao-satisfacao">
                                    <h4>Evolução da Satisfação (6 meses)</h4>
                                    <div style={{ width: '100%', height: 250 }}>
                                        <ResponsiveContainer>
                                            <LineChart
                                                data={estatisticasSatisfacao.avaliacoesPorMes}
                                                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                            >
                                                <XAxis dataKey="mes" fontSize={12} />
                                                <YAxis domain={[0, 5]} fontSize={12} />
                                                <Tooltip
                                                    formatter={(value: any) => [
                                                        `${Number(value).toFixed(1)} estrelas`,
                                                        'Média'
                                                    ]}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="media"
                                                    stroke="#ffc107"
                                                    strokeWidth={3}
                                                    name="Nota Média"
                                                    dot={{ fill: '#ffc107', r: 5 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Distribuição por Aspecto */}
                                <div className="chart chart-small" data-testid="chart-avaliacoes-aspecto">
                                    <h4>Avaliações por Aspecto</h4>
                                    <div className="ranking-list">
                                        {estatisticasSatisfacao.avaliacoesPorCategoria.map((cat: any, index: number) => (
                                            <div key={index} className="ranking-item">
                                                <div className="ranking-info">
                                                    <div className="ranking-name">{cat.categoria}</div>
                                                    <div className="ranking-stats">
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                            <FaStar style={{ color: '#ffc107', fontSize: '0.9rem' }} />
                                                            {cat.media.toFixed(1)}
                                                        </span>
                                                        <small>({cat.total} avaliações)</small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {estatisticasSatisfacao.avaliacoesPorCategoria.length === 0 && (
                                            <div className="no-data">Nenhuma avaliação disponível</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;