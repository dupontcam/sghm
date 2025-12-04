/**
 * Validadores de Input - Sistema SGHM
 * Validação de dados usando express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para verificar erros de validação
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: errors.array().map(err => ({
        campo: err.path,
        mensagem: err.msg
      }))
    });
  }
  next();
};

/**
 * Validadores para Médicos
 */
const validateMedico = {
  create: [
    body('nome_medico')
      .trim()
      .notEmpty().withMessage('Nome do médico é obrigatório')
      .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('crm')
      .trim()
      .notEmpty().withMessage('CRM é obrigatório')
      .matches(/^\d{4,10}$/).withMessage('CRM deve conter apenas números (4-10 dígitos)'),
    
    body('especialidade')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Especialidade deve ter no máximo 100 caracteres'),
    
    body('telefone')
      .optional()
      .trim()
      .matches(/^[\d\s\(\)\-\+]*$/).withMessage('Telefone em formato inválido'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    body('cnpj_cpf')
      .optional()
      .trim()
      .matches(/^\d{11}$|^\d{14}$/).withMessage('CPF/CNPJ deve ter 11 ou 14 dígitos'),
    
    body('percentual_repasse')
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Percentual deve estar entre 0 e 100'),
    
    handleValidationErrors
  ],
  
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    body('nome_medico')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('crm')
      .optional()
      .trim()
      .matches(/^\d{4,10}$/).withMessage('CRM deve conter apenas números (4-10 dígitos)'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    body('percentual_repasse')
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Percentual deve estar entre 0 e 100'),
    
    handleValidationErrors
  ],
  
  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    handleValidationErrors
  ]
};

/**
 * Validadores para Pacientes
 */
const validatePaciente = {
  create: [
    body('nome_paciente')
      .trim()
      .notEmpty().withMessage('Nome do paciente é obrigatório')
      .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('data_nascimento')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Data de nascimento inválida'),
    
    body('cpf')
      .trim()
      .notEmpty().withMessage('CPF é obrigatório')
      .matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
    
    body('telefone')
      .optional()
      .trim()
      .matches(/^[\d\s\(\)\-\+]*$/).withMessage('Telefone em formato inválido'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    body('convenio_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID do convênio inválido'),
    
    handleValidationErrors
  ],
  
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    body('nome_paciente')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('cpf')
      .optional()
      .trim()
      .matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
    
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    handleValidationErrors
  ],
  
  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    handleValidationErrors
  ]
};

/**
 * Validadores para Consultas
 */
const validateConsulta = {
  create: [
    body('medico_id')
      .isInt({ min: 1 }).withMessage('ID do médico é obrigatório e deve ser válido'),
    
    body('paciente_id')
      .isInt({ min: 1 }).withMessage('ID do paciente é obrigatório e deve ser válido'),
    
    body('data_consulta')
      .notEmpty().withMessage('Data da consulta é obrigatória')
      .isISO8601().withMessage('Data da consulta inválida'),
    
    body('valor_bruto')
      .isFloat({ min: 0 }).withMessage('Valor da consulta deve ser um número positivo'),
    
    body('plano_saude_id')
      .optional()
      .isInt({ min: 1 }).withMessage('ID do plano de saúde inválido'),
    
    handleValidationErrors
  ],
  
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    body('data_consulta')
      .optional()
      .isISO8601().withMessage('Data da consulta inválida'),
    
    body('valor_bruto')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor da consulta deve ser um número positivo'),
    
    handleValidationErrors
  ],
  
  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    handleValidationErrors
  ]
};

/**
 * Validadores para Planos de Saúde
 */
const validatePlano = {
  create: [
    body('nome_plano')
      .trim()
      .notEmpty().withMessage('Nome do plano é obrigatório')
      .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
    
    body('codigo_operadora')
      .optional()
      .trim(),
    
    body('tipo_plano')
      .optional()
      .isIn(['PARTICULAR', 'CONVENIO', 'SUS']).withMessage('Tipo de plano inválido'),
    
    body('valor_consulta_padrao')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor da consulta deve ser um número positivo'),
    
    handleValidationErrors
  ],
  
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    body('nome_plano')
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Nome deve ter entre 2 e 255 caracteres'),
    
    body('tipo_plano')
      .optional()
      .isIn(['PARTICULAR', 'CONVENIO', 'SUS']).withMessage('Tipo de plano inválido'),
    
    handleValidationErrors
  ],
  
  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    handleValidationErrors
  ]
};

/**
 * Validadores para Honorários
 */
const validateHonorario = {
  create: [
    body('consulta_id')
      .isInt({ min: 1 }).withMessage('ID da consulta é obrigatório e deve ser válido'),
    
    body('valor_bruto')
      .isFloat({ min: 0 }).withMessage('Valor bruto deve ser um número positivo'),
    
    body('valor_glosa')
      .optional()
      .isFloat({ min: 0 }).withMessage('Valor da glosa deve ser um número positivo'),
    
    body('status')
      .optional()
      .isIn(['PENDENTE', 'ENVIADO', 'PAGO', 'GLOSADO']).withMessage('Status inválido'),
    
    handleValidationErrors
  ],
  
  updateStatus: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    body('status')
      .notEmpty().withMessage('Status é obrigatório')
      .isIn(['PENDENTE', 'ENVIADO', 'PAGO', 'GLOSADO']).withMessage('Status inválido'),
    
    handleValidationErrors
  ],
  
  updateGlosa: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID inválido'),
    
    body('valor_glosa')
      .isFloat({ min: 0 }).withMessage('Valor da glosa deve ser um número positivo'),
    
    body('motivo_glosa')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Motivo da glosa deve ter no máximo 500 caracteres'),
    
    handleValidationErrors
  ]
};

/**
 * Validadores para Autenticação
 */
const validateAuth = {
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    body('senha')
      .notEmpty().withMessage('Senha é obrigatória')
      .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    
    handleValidationErrors
  ],
  
  createUser: [
    body('nome')
      .trim()
      .notEmpty().withMessage('Nome é obrigatório')
      .isLength({ min: 3, max: 255 }).withMessage('Nome deve ter entre 3 e 255 caracteres'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email é obrigatório')
      .isEmail().withMessage('Email inválido')
      .normalizeEmail(),
    
    body('senha')
      .notEmpty().withMessage('Senha é obrigatória')
      .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve conter maiúsculas, minúsculas e números'),
    
    body('role')
      .optional()
      .isIn(['ADMIN', 'OPERADOR']).withMessage('Role inválido (deve ser ADMIN ou OPERADOR)'),
    
    handleValidationErrors
  ]
};

/**
 * Validadores para Query Params
 */
const validateQuery = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100'),
    
    handleValidationErrors
  ],
  
  dateRange: [
    query('dataInicio')
      .optional()
      .isISO8601().withMessage('Data de início inválida'),
    
    query('dataFim')
      .optional()
      .isISO8601().withMessage('Data de fim inválida'),
    
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  validateMedico,
  validatePaciente,
  validateConsulta,
  validatePlano,
  validateHonorario,
  validateAuth,
  validateQuery
};
