const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

/*
 * ====================================================================
 * ROTAS DE BACKUP/RESTORE (STUB - FASE 1)
 * DESCRIÇÃO: Endpoints iniciais para exportar/importar snapshots
 * ACESSO: Apenas administradores
 * ====================================================================
 */

// GET /api/backup/history
// Retorna histórico básico (Fase 1: apenas stub em memória)
router.get('/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Histórico de backups (stub) retornado',
      data: []
    });
  } catch (error) {
    console.error('Erro ao obter histórico de backups:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/backup/export
// Exporta snapshot do banco (Fase 1: retorna amostra das tabelas principais)
router.post('/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Amostragem leve para evitar alto consumo
    const [usuarios, medicos, pacientes, planos, consultas, honorarios] = await Promise.all([
      prisma.usuarios.findMany({ take: 50 }),
      prisma.medicos.findMany({ take: 200 }),
      prisma.pacientes.findMany({ take: 500 }),
      prisma.planos_saude.findMany({ take: 200 }),
      prisma.consultas.findMany({ take: 1000 }),
      prisma.honorarios.findMany({ take: 1000 }),
    ]);

    const payload = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: { usuarios, medicos, pacientes, planosSaude: planos, consultas, honorarios }
    };

    res.status(200).json({ success: true, message: 'Export concluído (stub)', data: payload });
  } catch (error) {
    console.error('Erro no export de backup:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/backup/import
// Recebe JSON e realiza validação superficial (Fase 1: não aplica mudanças)
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, error: 'JSON de backup ausente ou inválido', code: 'INVALID_BACKUP_JSON' });
    }
    if (!body.version || !body.timestamp || !body.data) {
      return res.status(400).json({ success: false, error: 'Estrutura de backup inválida', code: 'INVALID_BACKUP_STRUCTURE' });
    }
    const required = ['usuarios', 'medicos', 'pacientes', 'planosSaude', 'consultas', 'honorarios'];
    const issues = [];
    for (const key of required) {
      if (!Array.isArray(body.data[key])) {
        issues.push(`Tabela '${key}' inválida ou ausente`);
      }
    }
    if (issues.length) {
      return res.status(400).json({ success: false, error: 'Validação falhou', details: issues, code: 'VALIDATION_FAILED' });
    }

    // Fase 1: apenas relatório (dry-run). Fase 2 aplicará via transação.
    const counts = required.reduce((acc, k) => { acc[k] = body.data[k].length; return acc; }, {});
    return res.status(200).json({ success: true, message: 'Import recebido (dry-run)', data: { counts } });
  } catch (error) {
    console.error('Erro no import de backup:', error);
    res.status(500).json({ success: false, error: 'Erro interno no servidor', code: 'INTERNAL_ERROR' });
  }
});

module.exports = router;
