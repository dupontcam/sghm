import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaKey, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import './UserProfile.css'; // Estilos específicos para esta página

const UserProfile: React.FC = () => {
  const { user, updateUser, updatePassword } = useAuth();
  
  // Dados do usuário logado
  const [userData, setUserData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cargo: user?.cargo || '',
    dataCriacao: '15/09/2025',
    ultimoAcesso: new Date().toLocaleString('pt-BR'),
  });

  // Atualizar dados quando o usuário mudar
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo || user.perfil,
        telefone: user.telefone || '',
      }));
    }
  }, [user]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar máscara de telefone
    if (name === 'telefone') {
      const telefoneFormatado = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
      setUserData(prev => ({ ...prev, [name]: telefoneFormatado }));
    } else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!userData.nome.trim()) {
      setFeedback({ type: 'error', message: 'Nome é obrigatório' });
      return;
    }
    if (!userData.email.trim() || !userData.email.includes('@')) {
      setFeedback({ type: 'error', message: 'Email inválido' });
      return;
    }
    
    // Atualiza dados do usuário no contexto e localStorage
    updateUser({
      nome: userData.nome,
      email: userData.email,
      cargo: userData.cargo,
      telefone: userData.telefone
    });
    
    setFeedback({ type: 'success', message: 'Dados atualizados com sucesso!' });
    
    // Limpar feedback após 3 segundos
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!passwordData.currentPassword) {
      setFeedback({ type: 'error', message: 'Senha atual é obrigatória' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Nova senha deve ter no mínimo 6 caracteres' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'As novas senhas não coincidem!' });
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setFeedback({ type: 'error', message: 'Nova senha deve ser diferente da atual' });
      return;
    }
    
    // Atualizar senha via AuthContext
    const success = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
    } else {
      setFeedback({ type: 'error', message: 'Senha atual incorreta. Tente novamente.' });
    }
    
    // Limpar feedback após 3 segundos
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Meu Perfil</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            Atualize seus dados pessoais e altere sua senha
          </p>
        </div>
      </div>

      {/* Card de Informações do Perfil */}
      <div className="profile-info-card">
        <div className="profile-avatar">
          <FaUser size={50} />
        </div>
        <div className="profile-details">
          <h2>{userData.nome}</h2>
          <div className="profile-meta">
            <span className={`badge-profile ${user?.perfil === 'Admin' ? 'badge-admin' : 'badge-operator'}`}>
              <FaShieldAlt /> {user?.perfil}
            </span>
            <span className="profile-email">
              <FaEnvelope /> {userData.email}
            </span>
          </div>
          <div className="profile-stats">
            <div>
              <small>Membro desde</small>
              <strong>{userData.dataCriacao}</strong>
            </div>
            <div>
              <small>Último acesso</small>
              <strong>{userData.ultimoAcesso}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback de Ações */}
      {feedback.message && (
        <div className={`profile-feedback feedback-${feedback.type}`}>
          {feedback.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="profile-container">
        {/* Formulário de Dados do Perfil */}
        <div className="profile-form-card">
          <div className="card-header-icon">
            <FaUser />
            <h3>Meus Dados</h3>
          </div>
          <form onSubmit={handleUserSubmit} className="form-modal">
            <div className="form-group">
              <label htmlFor="nome">
                <FaUser style={{ marginRight: '5px' }} />
                Nome Completo *
              </label>
              <input 
                id="nome" 
                name="nome" 
                type="text" 
                value={userData.nome} 
                onChange={handleUserChange}
                required
                placeholder="Digite seu nome completo"
              />
            </div>
            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="email">
                  <FaEnvelope style={{ marginRight: '5px' }} />
                  Email *
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={userData.email} 
                  onChange={handleUserChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <div className="form-group half-width">
                <label htmlFor="telefone">
                  <FaPhone style={{ marginRight: '5px' }} />
                  Telefone
                </label>
                <input 
                  id="telefone" 
                  name="telefone" 
                  type="tel" 
                  value={userData.telefone} 
                  onChange={handleUserChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cargo">
                <FaBriefcase style={{ marginRight: '5px' }} />
                Cargo (Perfil do Sistema)
              </label>
              <input 
                id="cargo" 
                name="cargo" 
                type="text" 
                value={userData.cargo} 
                disabled
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                O perfil é gerenciado pelo administrador do sistema
              </small>
            </div>
            <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <FaCheckCircle style={{ marginRight: '5px' }} />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Formulário de Troca de Senha */}
        <div className="profile-form-card">
          <div className="card-header-icon">
            <FaKey />
            <h3>Alterar Senha</h3>
          </div>
          <div className="security-notice">
            <FaShieldAlt />
            <p>Use uma senha forte com letras, números e símbolos. Mínimo de 6 caracteres.</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="form-modal">
            <div className="form-group">
              <label htmlFor="currentPassword">
                <FaKey style={{ marginRight: '5px' }} />
                Senha Atual *
              </label>
              <input 
                id="currentPassword" 
                name="currentPassword" 
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">
                <FaKey style={{ marginRight: '5px' }} />
                Nova Senha *
              </label>
              <input 
                id="newPassword" 
                name="newPassword" 
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                placeholder="Digite a nova senha"
              />
              {passwordData.newPassword && (
                <small style={{ 
                  color: passwordData.newPassword.length >= 6 ? '#28a745' : '#dc3545',
                  fontSize: '0.85rem',
                  display: 'block',
                  marginTop: '5px'
                }}>
                  {passwordData.newPassword.length >= 6 ? '✓ Senha forte' : '⚠ Senha muito curta'}
                </small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaKey style={{ marginRight: '5px' }} />
                Confirmar Nova Senha *
              </label>
              <input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Confirme a nova senha"
              />
              {passwordData.confirmPassword && (
                <small style={{ 
                  color: passwordData.newPassword === passwordData.confirmPassword ? '#28a745' : '#dc3545',
                  fontSize: '0.85rem',
                  display: 'block',
                  marginTop: '5px'
                }}>
                  {passwordData.newPassword === passwordData.confirmPassword ? '✓ Senhas coincidem' : '⚠ Senhas não coincidem'}
                </small>
              )}
            </div>
            <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <FaKey style={{ marginRight: '5px' }} />
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
