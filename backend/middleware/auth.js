const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * MIDDLEWARE: Verificação de Token JWT
 * DESCRIÇÃO: Valida token JWT e adiciona usuário ao request
 * ====================================================================
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acesso obrigatório',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
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

    // Anexar dados do usuário à requisição
    req.user = usuario;
    next();

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro interno na autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

/*
 * ====================================================================
 * MIDDLEWARE: Verificação de Permissão por Role
 * DESCRIÇÃO: Verifica se o usuário tem permissão baseada no role
 * ====================================================================
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Converter para array se for string
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissões insuficientes.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/*
 * ====================================================================
 * MIDDLEWARE: Admin Only
 * DESCRIÇÃO: Atalho para rotas que só admins podem acessar
 * ====================================================================
 */
const requireAdmin = requireRole(['ADMIN']);

/*
 * ====================================================================
 * MIDDLEWARE: Admin ou Operador
 * DESCRIÇÃO: Atalho para rotas que qualquer usuário logado pode acessar
 * ====================================================================
 */
const requireAuth = requireRole(['ADMIN', 'OPERADOR']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAuth
};