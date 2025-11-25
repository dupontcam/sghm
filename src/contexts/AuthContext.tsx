import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosService } from '../services/usuariosService';

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

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);
  };

  const logout = () => {
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
    const result = usuariosService.updatePassword(user.id, currentPassword, newPassword);
    
    if (result.success) {
      console.log('✅ Senha atualizada com sucesso no localStorage');
      // Verificar se realmente salvou
      const verificacao = usuariosService.getById(user.id);
      console.log('🔍 Senha verificada no service:', verificacao?.senha === newPassword);
    } else {
      console.error('❌ Erro ao atualizar senha:', result.error);
    }
    
    return result.success;
  };

  const value = {
    user,
    userProfile: user?.perfil || 'Operador',
    isAuthenticated: !!user,
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