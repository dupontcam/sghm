const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTA: POST /api/auth/login
 * DESCRIÇÃO: Autentica usuário e retorna token JWT
 * ====================================================================
 */
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios',
      code: 'MISSING_CREDENTIALS'
    });
  }

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

module.exports = router;