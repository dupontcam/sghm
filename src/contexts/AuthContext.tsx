import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosService } from '../services/usuariosService';
import { backupService } from '../services/backupService';
import { authAPI } from '../services/api';

// Define os tipos de perfil que o sistema aceita
export type UserProfile = 'Admin' | 'Operador';

// Interface do usuário autenticado
interface User {
  id: number;
  nome: string;
  email: string;
  perfil: UserProfile;
  cargo?: string;
  telefone?: string;
}

// Define o que o nosso contexto irá fornecer
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Chaves para localStorage
const USER_KEY = 'sghm_user';
const TOKEN_KEY = 'sghm_token';

// Cria o contexto com um valor padrão (que não será usado diretamente)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor" - um componente que envolve nossa aplicação
// e "provê" o estado de autenticação para todos os filhos
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ Usuário restaurado do localStorage:', userData.nome);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    console.log('🔐 AuthContext - Login chamado');
    console.log('🔐 AuthContext - User:', userData);
    console.log('🔐 AuthContext - Token (primeiros 20 chars):', token.substring(0, 20) + '...');

    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);

    console.log('✅ AuthContext - Token salvo no localStorage');
    console.log('✅ AuthContext - Verificação:', localStorage.getItem(TOKEN_KEY) ? 'Token encontrado' : 'Token NÃO encontrado');
  };

  const logout = () => {
    // Criar backup automático ao fazer logout se habilitado
    const config = backupService.getAutoBackupConfig();
    if (config.enabled) {
      try {
        // Buscar dados do localStorage para backup
        const consultasData = localStorage.getItem('sghm_consultas');
        const honorariosData = localStorage.getItem('sghm_honorarios');
        const medicosData = localStorage.getItem('sghm_medicos');
        const pacientesData = localStorage.getItem('sghm_pacientes');
        const planosData = localStorage.getItem('sghm_planos_saude');

        const consultas = consultasData ? JSON.parse(consultasData) : [];
        const honorarios = honorariosData ? JSON.parse(honorariosData) : [];
        const medicos = medicosData ? JSON.parse(medicosData) : [];
        const pacientes = pacientesData ? JSON.parse(pacientesData) : [];
        const planosSaude = planosData ? JSON.parse(planosData) : [];

        backupService.createBackup(
          consultas,
          honorarios,
          medicos,
          pacientes,
          planosSaude,
          'automatico'
        );
        console.log('✅ Backup automático criado ao fazer logout');
      } catch (error) {
        console.error('❌ Erro ao criar backup no logout:', error);
      }
    }

    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    // Atualizar no service (localStorage de usuários)
    const success = usuariosService.updateProfile(user.id, {
      nome: userData.nome,
      email: userData.email,
      telefone: userData.telefone,
      cargo: userData.cargo
    });

    if (success) {
      // Recarregar dados do service para garantir sincronização
      const usuarioAtualizado = usuariosService.getById(user.id);
      if (usuarioAtualizado) {
        const updatedUser: User = {
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          email: usuarioAtualizado.email,
          perfil: usuarioAtualizado.perfil,
          cargo: usuarioAtualizado.cargo,
          telefone: usuarioAtualizado.telefone,
        };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    console.log('🔑 Atualizando senha do usuário:', user.id);

    try {
      await authAPI.changePassword(currentPassword, newPassword);
      console.log('✅ Senha atualizada com sucesso no backend');
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar senha:', error);

      // Fallback para mock apenas se backend não estiver disponível (opcional)
      if (error.message && error.message.includes('fetch')) {
        const result = usuariosService.updatePassword(user.id, currentPassword, newPassword);
        return result.success;
      }

      return false;
    }
  };

  const value = {
    user,
    userProfile: user?.perfil || 'Operador',
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Cria um "Hook" customizado para facilitar o acesso ao contexto
// Em vez de usar useContext(AuthContext) em todo lugar, usamos useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};