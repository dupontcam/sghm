import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login com:', email, password);
        navigate('/dashboard');
    };

    return (
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
    );
};

export default Login;
