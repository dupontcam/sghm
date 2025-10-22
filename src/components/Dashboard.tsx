import React from 'react';
import '../App.css'; // Estilos dos cards vêm do App.css

// Importa o hook de autenticação
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    // Acessa o perfil atual
    const { userProfile } = useAuth();

    return (
        <div className="page-container">
            <div className="page-header">
                {/* Personaliza a saudação (exemplo) */}
                {userProfile === 'Admin' ? (
                    <h1>Bem vindo, Administrador</h1>
                ) : (
                    <h1>Bem vindo, Operador</h1>
                )}
            </div>
            
            <h3>Visão Geral</h3>

            {/* Cards de estatísticas */}
            <div className="stats-cards">

                {/* === INÍCIO DA RESTRIÇÃO DE ACESSO === */}
                {/* Cards financeiros visíveis apenas para o Admin */}
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
                {/* === FIM DA RESTRIÇÃO DE ACESSO === */}

                {/* Card visível para todos os perfis */}
                <div className="card card-2">
                    <span>Consultas Registradas</span>
                    <strong>1.601</strong>
                </div>
            </div>

            {/* Gráficos (placeholders) */}
            <div className="charts-container">
                <div className="chart chart-large">
                    <h4>Tendência de Faturamento (Últimos 6 meses)</h4>
                    <div className="placeholder-chart">[Gráfico de Barras - Trend]</div>
                </div>
                <div className="chart chart-small">
                    <h4>Status dos Pagamentos</h4>
                    <div className="placeholder-chart">[Gráfico de Rosca - Sales]</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

