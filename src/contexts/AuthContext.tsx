import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define os tipos de perfil que o sistema aceita
export type UserProfile = 'Admin' | 'Operador';

// Interface do usuário autenticado
interface User {
  id: number;
  nome: string;
  email: string;
  perfil: UserProfile;
  cargo?: string;
}

// Define o que o nosso contexto irá fornecer
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
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

  const value = {
    user,
    userProfile: user?.perfil || 'Operador',
    isAuthenticated: !!user,
    login,
    logout,
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