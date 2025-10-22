import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define os tipos de perfil que o sistema aceita
export type UserProfile = 'Admin' | 'Operador';

// Define o que o nosso contexto irá fornecer
interface AuthContextType {
  userProfile: UserProfile;
  toggleProfile: () => void; // Função para simular a troca de perfil
}

// Cria o contexto com um valor padrão (que não será usado diretamente)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor" - um componente que envolve nossa aplicação
// e "provê" o estado do perfil para todos os filhos
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // O estado que armazena o perfil atual. Começa como Admin.
  const [userProfile, setUserProfile] = useState<UserProfile>('Admin');

  // A lógica para o botão de simulação
  const toggleProfile = () => {
    setUserProfile(currentProfile => 
      currentProfile === 'Admin' ? 'Operador' : 'Admin'
    );
  };

  return (
    <AuthContext.Provider value={{ userProfile, toggleProfile }}>
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