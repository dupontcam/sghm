import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div>
            <header className="main-header">
                <h2>Bem vindo, Carlos</h2>
            </header>
            
            <h3>Dashboard</h3>

            <div className="stats-cards">
                <div className="card card-1">
                    <span>Current MRR</span>
                    <strong>$12.4k</strong>
                </div>
                <div className="card card-2">
                    <span>Current Customers</span>
                    <strong>16,601</strong>
                </div>
                <div className="card card-3">
                    <span>%</span>
                    <strong>33%</strong>
                </div>
                <div className="card card-4">
                    <span>Churn Rate</span>
                    <strong>2%</strong>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart chart-large">
                    <h4>Trend</h4>
                    <div className="placeholder-chart">[Gráfico de Barras - Trend]</div>
                </div>
                <div className="chart chart-small">
                    <h4>Sales</h4>
                    <div className="placeholder-chart">[Gráfico de Rosca - Sales]</div>
                </div>
                <div className="chart chart-medium">
                    <h4>Transactions</h4>
                    <div className="placeholder-chart">[Lista de Transações]</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
