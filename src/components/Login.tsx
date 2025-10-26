import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import AlertModal from './AlertModal'; 

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // 2. Criar um estado para o modal de instruções, começando como 'true'
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(true);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login com:', email, password);
        navigate('/dashboard');
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
                        <form onSubmit={handleLogin}>
                            <div className="input-group">
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    placeholder="Senha" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                            <button type="submit" className="login-button">Entrar</button>
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
