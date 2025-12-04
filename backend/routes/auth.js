const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin, requireAuth } = require('../middleware/auth');
const { validateAuth } = require('../middleware/validators');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: POST /api/auth/login
 * DESCRIÇÃO: Autentica usuário e retorna token JWT
 * ====================================================================
 */
router.post('/login', validateAuth.login, async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Buscar usuário por email
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        senha: true,
        nome_completo: true,
        role: true,
        created_at: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Gerar tokens JWT
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        role: usuario.role 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    const refreshToken = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        role: usuario.role 
      },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      }
    );

    // Registrar último login (opcional)
    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { updated_at: new Date() }
    });

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        refreshToken,
        user: {
          id: usuario.id,
          email: usuario.email,
          nome_completo: usuario.nome_completo,
          role: usuario.role,
          created_at: usuario.created_at
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: POST /api/auth/register
 * DESCRIÇÃO: Registra novo usuário (apenas para admins)
 * ====================================================================
 */
router.post('/register', async (req, res) => {
  const { email, senha, nome_completo, role, cpf, telefone } = req.body;

  // Validação básica
  if (!email || !senha || !nome_completo || !role) {
    return res.status(400).json({
      success: false,
      error: 'Email, senha, nome completo e role são obrigatórios',
      code: 'MISSING_FIELDS'
    });
  }

  if (!['ADMIN', 'OPERADOR'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Role deve ser ADMIN ou OPERADOR',
      code: 'INVALID_ROLE'
    });
  }

  try {
    // Verificar se email já existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Criar usuário
    const novoUsuario = await prisma.usuarios.create({
      data: {
        email: email.toLowerCase(),
        senha: senhaHash,
        nome_completo,
        role,
        cpf: cpf || null,
        telefone: telefone || null
      },
      select: {
        id: true,
        email: true,
        nome_completo: true,
        role: true,
        created_at: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: novoUsuario
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Email ou CPF já cadastrado',
        code: 'DUPLICATE_FIELD'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/auth/me
 * DESCRIÇÃO: Retorna dados do usuário logado
 * ====================================================================
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nome_completo: true,
        role: true,
        cpf: true,
        telefone: true,
        created_at: true,
        updated_at: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        user: usuario
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

/*
 * ====================================================================
 * ROTA: POST /api/auth/refresh
 * DESCRIÇÃO: Renovar token JWT usando refreshToken
 * ====================================================================
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  // Validação básica
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'RefreshToken é obrigatório',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }

  try {
    // Verificar se o refreshToken é válido
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Buscar usuário no banco para validar se ainda existe
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nome_completo: true,
        role: true,
        created_at: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Gerar novos tokens
    const novoToken = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        role: usuario.role 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    const novoRefreshToken = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        role: usuario.role 
      },
      process.env.JWT_REFRESH_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: novoToken,
        refreshToken: novoRefreshToken,
        user: {
          id: usuario.id,
          email: usuario.email,
          nome_completo: usuario.nome_completo,
          role: usuario.role
        }
      }
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'RefreshToken inválido',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'RefreshToken expirado. Faça login novamente.',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/*
 * ====================================================================
 * ROTA: POST /api/auth/logout
 * DESCRIÇÃO: Logout (principalmente para limpar logs no servidor)
 * ====================================================================
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Aqui poderia implementar uma blacklist de tokens se necessário
    // Por enquanto, apenas confirma o logout
    
    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

/*
 * ====================================================================
 * ROTA: POST /api/auth/create-user
 * DESCRIÇÃO: Permite ao Admin criar novos usuários (Operadores)
 * ACESSO: Apenas ADMIN
 * ====================================================================
 */
router.post('/create-user', authenticateToken, requireAdmin, validateAuth.createUser, async (req, res) => {
  try {
    const { email, senha, nome_completo, role = 'OPERADOR' } = req.body;

    // Validar força da senha
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres',
        code: 'WEAK_PASSWORD'
      });
    }

    // Validar role
    if (!['ADMIN', 'OPERADOR'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role deve ser ADMIN ou OPERADOR',
        code: 'INVALID_ROLE'
      });
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        error: 'Email já está sendo usado por outro usuário',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12);

    // Criar usuário
    const novoUsuario = await prisma.usuarios.create({
      data: {
        email,
        senha: hashedPassword,
        nome_completo,
        role
      },
      select: {
        id: true,
        email: true,
        nome_completo: true,
        role: true,
        created_at: true
      }
    });

    console.log(`[AUTH] Admin ${req.user.email} criou usuário: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: novoUsuario,
      created_by: {
        id: req.user.id,
        email: req.user.email
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Email já está sendo usado',
        code: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno ao criar usuário',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/auth/change-password
 * DESCRIÇÃO: Permite ao usuário alterar sua própria senha
 * ACESSO: ADMIN e OPERADOR (apenas própria conta)
 * ====================================================================
 */
router.put('/change-password', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;

    // Validação de entrada
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual e nova senha são obrigatórias',
        code: 'MISSING_PASSWORDS'
      });
    }

    // Validar força da nova senha
    if (nova_senha.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha deve ter pelo menos 6 caracteres',
        code: 'WEAK_PASSWORD'
      });
    }

    // Buscar usuário atual com senha
    const usuario = await prisma.usuarios.findUnique({
      where: { id: req.user.id }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senha_atual, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Verificar se nova senha é diferente da atual
    const mesmaSenha = await bcrypt.compare(nova_senha, usuario.senha);
    if (mesmaSenha) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha deve ser diferente da senha atual',
        code: 'SAME_PASSWORD'
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(nova_senha, 12);

    // Atualizar senha
    await prisma.usuarios.update({
      where: { id: req.user.id },
      data: { 
        senha: hashedNewPassword,
        updated_at: new Date()
      }
    });

    console.log(`[AUTH] Usuário ${req.user.email} alterou sua senha`);

    res.status(200).json({
      success: true,
      message: 'Senha alterada com sucesso',
      user: {
        id: req.user.id,
        email: req.user.email,
        nome_completo: req.user.nome_completo
      }
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao alterar senha',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: GET /api/auth/users
 * DESCRIÇÃO: Lista todos os usuários (Admin only)
 * ACESSO: Apenas ADMIN
 * ====================================================================
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        email: true,
        nome_completo: true,
        role: true,
        created_at: true,
        updated_at: true
      },
      orderBy: [
        { role: 'asc' },
        { nome_completo: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
      requested_by: {
        id: req.user.id,
        email: req.user.email
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao listar usuários',
      details: error.message
    });
  }
});

/*
 * ====================================================================
 * ROTA: PUT /api/auth/users/:id
 * DESCRIÇÃO: Permite ao Admin atualizar dados de usuários
 * ACESSO: Apenas ADMIN
 * ====================================================================
 */
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nome_completo, role } = req.body;

    // Validar ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuário inválido',
        code: 'INVALID_USER_ID'
      });
    }

    // Verificar se usuário existe
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { id: userId }
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {};

    if (email) {
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de email inválido',
          code: 'INVALID_EMAIL'
        });
      }

      // Verificar se email já está sendo usado por outro usuário
      const emailEmUso = await prisma.usuarios.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (emailEmUso) {
        return res.status(409).json({
          success: false,
          error: 'Email já está sendo usado por outro usuário',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }

      dadosAtualizacao.email = email;
    }

    if (nome_completo) {
      dadosAtualizacao.nome_completo = nome_completo;
    }

    if (role) {
      if (!['ADMIN', 'OPERADOR'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Role deve ser ADMIN ou OPERADOR',
          code: 'INVALID_ROLE'
        });
      }
      dadosAtualizacao.role = role;
    }

    // Não permitir que admin remova seu próprio role de admin
    if (userId === req.user.id && role === 'OPERADOR') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível remover seu próprio acesso de administrador',
        code: 'CANNOT_DEMOTE_SELF'
      });
    }

    dadosAtualizacao.updated_at = new Date();

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: userId },
      data: dadosAtualizacao,
      select: {
        id: true,
        email: true,
        nome_completo: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    console.log(`[AUTH] Admin ${req.user.email} atualizou usuário ID ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      user: usuarioAtualizado,
      updated_by: {
        id: req.user.id,
        email: req.user.email
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Email já está sendo usado',
        code: 'DUPLICATE_EMAIL'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno ao atualizar usuário',
      details: error.message
    });
  }
});

module.exports = router;