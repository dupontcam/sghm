import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserProfile.css'; // Estilos específicos para esta página

const UserProfile: React.FC = () => {
  const { userProfile } = useAuth();
  
  // Simula os dados do usuário logado
  const [userData, setUserData] = useState({
    nome: userProfile === 'Admin' ? 'Administrador do Sistema' : 'Operador Padrão',
    email: userProfile === 'Admin' ? 'admin@sghm.com' : 'operador@sghm.com',
    telefone: '(61) 99999-0001',
    cargo: userProfile,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica (simulada) para salvar dados do usuário
    console.log('Dados do usuário salvos:', userData);
    // Em um app real, aqui mostraria um modal de sucesso
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Em um app real, mostraria um AlertModal
      console.error('As novas senhas não coincidem!');
      return;
    }
    // Lógica (simulada) para trocar a senha
    console.log('Senha alterada com sucesso.');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Perfil do Usuário</h1>
      </div>

      <div className="profile-container">
        {/* Formulário de Dados do Perfil */}
        <div className="profile-form-card">
          <h3>Meus Dados</h3>
          <form onSubmit={handleUserSubmit} className="form-modal">
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <input 
                id="nome" 
                name="nome" 
                type="text" 
                value={userData.nome} 
                onChange={handleUserChange} 
              />
            </div>
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="email">Email</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={userData.email} 
                  onChange={handleUserChange} 
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="telefone">Telefone</label>
                <input 
                  id="telefone" 
                  name="telefone" 
                  type="tel" 
                  value={userData.telefone} 
                  onChange={handleUserChange} 
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cargo">Cargo (Perfil)</label>
              <input 
                id="cargo" 
                name="cargo" 
                type="text" 
                value={userData.cargo} 
                disabled // O perfil é controlado pelo sistema
              />
            </div>
            <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Formulário de Troca de Senha */}
        <div className="profile-form-card">
          <h3>Alterar Senha</h3>
          <form onSubmit={handlePasswordSubmit} className="form-modal">
            <div className="form-group">
              <label htmlFor="currentPassword">Senha Atual</label>
              <input 
                id="currentPassword" 
                name="currentPassword" 
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <input 
                id="newPassword" 
                name="newPassword" 
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange} 
              />
            </div>
            <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                Redefinir Senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
