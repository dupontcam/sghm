import { Usuario, mockUsuarios } from '../data/mockData';

const USUARIOS_KEY = 'sghm_usuarios';

// Classe para gerenciar usuários com persistência em localStorage
class UsuariosService {
  // Inicializar localStorage com dados mockados se não existir
  private initialize(): void {
    const stored = localStorage.getItem(USUARIOS_KEY);
    if (!stored) {
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(mockUsuarios));
    }
  }

  // Obter todos os usuários
  getAll(): Usuario[] {
    this.initialize();
    const stored = localStorage.getItem(USUARIOS_KEY);
    return stored ? JSON.parse(stored) : mockUsuarios;
  }

  // Obter usuário por ID
  getById(id: number): Usuario | undefined {
    const usuarios = this.getAll();
    return usuarios.find(u => u.id === id);
  }

  // Obter usuário por email (para login)
  getByEmail(email: string): Usuario | undefined {
    const usuarios = this.getAll();
    return usuarios.find(u => u.email === email);
  }

  // Validar senha
  validatePassword(email: string, senha: string): Usuario | null {
    const usuario = this.getByEmail(email);
    if (usuario && usuario.senha === senha && usuario.ativo) {
      return usuario;
    }
    return null;
  }

  // Criar novo usuário
  create(usuario: Omit<Usuario, 'id'>): Usuario {
    const usuarios = this.getAll();
    const newId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    const newUsuario: Usuario = { id: newId, ...usuario };
    usuarios.push(newUsuario);
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return newUsuario;
  }

  // Atualizar usuário (dados gerais)
  update(usuario: Usuario): boolean {
    const usuarios = this.getAll();
    const index = usuarios.findIndex(u => u.id === usuario.id);
    if (index === -1) return false;
    
    usuarios[index] = usuario;
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return true;
  }

  // Atualizar apenas dados pessoais (nome, email, telefone)
  updateProfile(id: number, data: { nome?: string; email?: string; telefone?: string; cargo?: string }): boolean {
    const usuarios = this.getAll();
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    usuarios[index] = { ...usuarios[index], ...data };
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return true;
  }

  // Atualizar senha
  updatePassword(id: number, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    const usuarios = this.getAll();
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index === -1) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    if (usuarios[index].senha !== currentPassword) {
      return { success: false, error: 'Senha atual incorreta' };
    }
    
    usuarios[index].senha = newPassword;
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return { success: true };
  }

  // Resetar senha (Admin pode fazer sem senha atual)
  resetPassword(id: number, newPassword: string): boolean {
    const usuarios = this.getAll();
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    usuarios[index].senha = newPassword;
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return true;
  }

  // Excluir usuário
  delete(id: number): boolean {
    const usuarios = this.getAll();
    const index = usuarios.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    usuarios.splice(index, 1);
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return true;
  }

  // Limpar cache (útil para testes)
  clearCache(): void {
    localStorage.removeItem(USUARIOS_KEY);
  }
}

export const usuariosService = new UsuariosService();
