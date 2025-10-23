import React from 'react';
import '../App.css'; // Estilos dos cards vêm do App.css
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext'; // 1. Importar o hook useData
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
    PieChart, Pie, Cell, Tooltip as PieTooltip 
} from 'recharts';

// 2. Não precisamos mais importar mockConsultas daqui

// --- Processamento de Dados para os Gráficos ---

// 3. A função agora recebe as consultas como parâmetro
const processPieData = (consultas: any[]) => {
    const statusCounts = {
        Pendente: 0,
        Pago: 0,
        Glosado: 0,
    };

    consultas.forEach(consulta => {
        if (consulta.status === 'Pendente') statusCounts.Pendente++;
        if (consulta.status === 'Pago') statusCounts.Pago++;
        if (consulta.status === 'Glosado') statusCounts.Glosado++;
    });

    return [
        { name: 'Pendente', value: statusCounts.Pendente },
        { name: 'Pago', value: statusCounts.Pago },
        { name: 'Glosado', value: statusCounts.Glosado },
    ].filter(entry => entry.value > 0);
};

const PIE_COLORS = {
    Pendente: '#ffc107', // Amarelo
    Pago: '#28a745',     // Verde
    Glosado: '#dc3545',   // Vermelho
};

// ... (barChartData continua o mesmo)
const barChartData = [
    { name: 'Maio', Faturamento: 8200, Glosado: 500 },
    { name: 'Junho', Faturamento: 9500, Glosado: 300 },
    { name: 'Julho', Faturamento: 11000, Glosado: 800 },
    { name: 'Agosto', Faturamento: 10500, Glosado: 450 },
    { name: 'Setembro', Faturamento: 12400, Glosado: 600 },
    { name: 'Outubro', Faturamento: 11800, Glosado: 700 },
];

// --- Componente do Dashboard ---

const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const { consultas } = useData(); // 4. Obter as consultas do Contexto
    const pieData = processPieData(consultas); // 5. Processar os dados do Contexto

    return (
        <div className="page-container">
            <div className="page-header">
                {userProfile === 'Admin' ? (
                    <h1>Bem vindo, Administrador</h1>
                ) : (
                    <h1>Bem vindo, Operador</h1>
                )}
            </div>
            
            <h3>Visão Geral</h3>

            {/* Cards de estatísticas */}
            <div className="stats-cards">
                {userProfile === 'Admin' && (
                    <>
                        <div className="card card-1">
                            <span>Total a Receber (MRR)</span>
                            <strong>R$ 12.4k</strong>
                        </div>
                        <div className="card card-3">
                            <span>Taxa de Glosa</span>
                            <strong>3.3%</strong>
                        </div>
                        <div className="card card-4">
                            <span>Repassado (Mês)</span>
                            <strong>R$ 10.2k</strong>
                        </div>
                    </>
                )}
                <div className="card card-2">
                    <span>Consultas Registradas</span>
                    {/* 6. Usar o length das consultas do Contexto */}
                    <strong>{consultas.length}</strong>
                </div>
            </div>

            {/* Gráficos Reais */}
            {userProfile === 'Admin' && (
                <div className="charts-container">
                    
                    {/* Gráfico de Barras */}
                    <div className="chart chart-large">
                        <h4>Tendência de Faturamento (Últimos 6 meses)</h4>
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={barChartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={(value) => `R$${value/1000}k`} />
                                    <Tooltip formatter={(value) => `R$${(value as number).toLocaleString('pt-BR')}`} />
                                    <Legend />
                                    <Bar dataKey="Faturamento" fill="#007bff" />
                                    <Bar dataKey="Glosado" fill="#dc3545" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de Pizza */}
                    <div className="chart chart-small">
                        <h4>Status dos Pagamentos</h4>
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
                                            <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS]} />
                                        ))}
                                    </Pie>
                                    <PieTooltip formatter={(value) => `${value} consultas`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;