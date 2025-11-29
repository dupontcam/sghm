import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaSearch, FaShieldAlt, FaUser, FaEnvelope, FaPhone, FaKey } from 'react-icons/fa';
import { Usuario } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { usuariosAPI } from '../services/api';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import './CadastroMedicos.css';

const GestaoUsuarios: React.FC = () => {
  const { userProfile, user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState<Omit<Usuario, 'id'>>({
    nome: '',
    email: '',
    senha: '',
    perfil: 'Operador',
    cargo: '',
    telefone: '',
    ativo: true
  });

  // Carregar usuários
  const loadUsuarios = async () => {
    try {
      const loadedUsuarios = await usuariosAPI.getAll();
      // Filtrar para não mostrar o próprio usuário logado (edita no perfil)
      const filteredUsers = loadedUsuarios.filter(u => u.id !== user?.id);
      setUsuarios(filteredUsers);
      setFilteredUsuarios(filteredUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [user]);

  // Filtrar usuários
  useEffect(() => {
    const filtered = usuarios.filter(usuario =>
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsuarios(filtered);
  }, [searchTerm, usuarios]);

  // Abrir modal para adicionar
  const handleAdd = () => {
    setCurrentUsuario(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      perfil: 'Operador',
      cargo: '',
      telefone: '',
      ativo: true
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Senha não é editada aqui
      perfil: usuario.perfil,
      cargo: usuario.cargo,
      telefone: usuario.telefone || '',
      ativo: usuario.ativo
    });
    setIsModalOpen(true);
  };

  // Confirmar exclusão
  const handleDeleteClick = (id: number) => {
    setUsuarioToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Executar exclusão
  const handleDelete = async () => {
    if (usuarioToDelete !== null) {
      try {
        await usuariosAPI.delete(usuarioToDelete);
        await loadUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. A funcionalidade pode não estar disponível no servidor.');
      }
    }
    setIsDeleteModalOpen(false);
    setUsuarioToDelete(null);
  };

  // Salvar usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentUsuario) {
        // Editar usuário existente
        const updatedUsuario: Usuario = {
          ...currentUsuario,
          nome: formData.nome,
          email: formData.email,
          perfil: formData.perfil,
          cargo: formData.cargo,
          telefone: formData.telefone,
          ativo: formData.ativo
        };

        await usuariosAPI.update(updatedUsuario.id, updatedUsuario);

        // Se forneceu nova senha, resetar (backend trata isso no update se implementado, mas aqui o endpoint update não muda senha)
        // O endpoint update do backend NÃO muda senha. Precisa de endpoint específico ou alterar a lógica.
        // Por enquanto, vamos ignorar a alteração de senha na edição se não houver endpoint.

        await loadUsuarios();
      } else {
        // Adicionar novo usuário
        await usuariosAPI.create(formData);
        await loadUsuarios();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Verifique os dados e tente novamente.');
    }
  };

  // Atualizar campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Máscara de telefone
    if (name === 'telefone') {
      const telefoneFormatado = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
      setFormData(prev => ({ ...prev, [name]: telefoneFormatado }));
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Verificar permissão (apenas Admin)
  if (userProfile !== 'Admin') {
    return (
      <div className="page-container">
        <div className="alert alert-warning">
          <FaShieldAlt style={{ marginRight: '10px' }} />
          Acesso negado. Apenas administradores podem gerenciar outros usuários.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Gestão de Usuários</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            Crie e gerencie operadores do sistema (edite seu próprio perfil em "Meu Perfil")
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaUserPlus style={{ marginRight: '5px' }} />
          Novo Usuário
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Pesquisar por nome, email ou cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabela de Usuários */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Perfil</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefone || '-'}</td>
                  <td>
                    <span className={`badge ${usuario.perfil === 'Admin' ? 'badge-success' : 'badge-info'}`}>
                      {usuario.perfil}
                    </span>
                  </td>
                  <td>{usuario.cargo}</td>
                  <td>
                    <span className={`badge ${usuario.ativo ? 'badge-success' : 'badge-danger'}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(usuario)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteClick(usuario.id)}
                        title="Excluir"
                        disabled={usuario.perfil === 'Admin' && usuarios.filter(u => u.perfil === 'Admin').length === 1}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentUsuario ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <form onSubmit={handleSubmit} className="form-modal">
          <div className="form-group">
            <label htmlFor="nome">
              <FaUser style={{ marginRight: '5px' }} />
              Nome Completo *
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
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
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="usuario@exemplo.com"
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
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              <FaKey style={{ marginRight: '5px' }} />
              {currentUsuario ? 'Nova Senha (opcional)' : 'Senha Inicial *'}
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              required={!currentUsuario}
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              {currentUsuario
                ? 'Deixe em branco para manter a senha atual'
                : 'O usuário poderá alterar a senha após o primeiro login'}
            </small>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="perfil">
                <FaShieldAlt style={{ marginRight: '5px' }} />
                Perfil do Sistema *
              </label>
              <select
                id="perfil"
                name="perfil"
                value={formData.perfil}
                onChange={handleChange}
                required
              >
                <option value="Operador">Operador</option>
                <option value="Admin">Administrador</option>
              </select>
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Admin: acesso total | Operador: acesso restrito
              </small>
            </div>
            <div className="form-group half-width">
              <label htmlFor="cargo">
                <FaUser style={{ marginRight: '5px' }} />
                Cargo *
              </label>
              <input
                id="cargo"
                name="cargo"
                type="text"
                value={formData.cargo}
                onChange={handleChange}
                required
                placeholder="Ex: Operador de Sistema"
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              <span>Usuário ativo</span>
            </label>
            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              Usuários inativos não podem fazer login no sistema
            </small>
          </div>

          <div className="form-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {currentUsuario ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default GestaoUsuarios;
