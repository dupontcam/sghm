import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import AlertModal from './AlertModal';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    // 2. Criar um estado para o modal de instruções, começando como 'false' agora
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log('Tentando login com:', { email, senha: '***' });

        try {
            const response = await authAPI.login(email, password);
            console.log('Resposta completa do login:', response);
            
            // A resposta sempre vem no formato response.data
            if (!response.data?.usuario || !response.data?.token) {
                console.error('Formato de resposta inválido:', response);
                throw new Error('Resposta inválida do servidor');
            }
            
            // Salvar usuário e token no contexto
            const userInfo = {
                id: response.data.usuario.id,
                nome: response.data.usuario.nome,
                email: response.data.usuario.email,
                perfil: response.data.usuario.perfil as 'Admin' | 'Operador',
                cargo: response.data.usuario.cargo,
                telefone: response.data.usuario.telefone,
            };
            
            console.log('Dados do usuário processados:', userInfo);
            
            login(userInfo, response.data.token);
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Erro no login:', err);
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="login-container">
                <div className="login-art-column">
                    <p>Imagem de fundo / Colagem</p>
                </div>
                <div className="login-form-column">
                    <div className="login-form-wrapper">
                        <h1 className="login-title">
                            SISTEMA DE GERENCIAMENTO<br/>DE HONORÁRIOS MÉDICOS
                        </h1>
                        <span className="login-subtitle">DESDE 2021</span>
                        
                        <h2 className="login-header">LOGIN</h2>
                        {error && (
                            <div style={{ 
                                color: '#d32f2f', 
                                backgroundColor: '#ffebee', 
                                padding: '10px', 
                                borderRadius: '4px', 
                                marginBottom: '15px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <input 
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <input 
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Senha"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required 
                                />
                            </div>
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* 4. Renderizar o Modal de Alerta */}         
            <AlertModal
                    isOpen={isHelpModalOpen}
                    onClose={() => setIsHelpModalOpen(false)}
                    title="Bem-vindo ao Protótipo SGHM"
                    message={`Este é um protótipo interativo. Siga estas dicas para testar:

1. LOGIN: Você pode usar qualquer e-mail e senha para entrar.

2. DADOS: O protótipo é interativo (pode criar/excluir), mas não salva dados. Se você atualizar a página (F5), tudo será reiniciado.

3. PERFIS: No menu lateral, use o botão 'Simular Perfil' para alternar entre 'Admin' e 'Operador' e ver as restrições de acesso.`}
            />
        </>
    );
};

export default Login;
