/*
 * ====================================================================
 * NOVOS ENDPOINTS PARA RECURSOS DE GLOSA E HISTÓRICO
 * Adicionar ANTES de: module.exports = router;
 * ====================================================================
 */

/*
 * ====================================================================
 * ROTA: PUT /api/honorarios/:id/recurso
 * DESCRIÇÃO: Enviar recurso de glosa
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.put('/:id/recurso', authenticateToken, requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo_recurso, data_recurso } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                error: 'ID do honorário inválido',
                code: 'INVALID_ID'
            });
        }

        if (!motivo_recurso || !motivo_recurso.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Motivo do recurso é obrigatório',
                code: 'MISSING_MOTIVO_RECURSO'
            });
        }

        // Verificar se o honorário existe e está glosado
        const honorario = await prisma.honorarios.findUnique({
            where: { id: parseInt(id) }
        });

        if (!honorario) {
            return res.status(404).json({
                success: false,
                error: 'Honorário não encontrado',
                code: 'HONORARIO_NOT_FOUND'
            });
        }

        if (honorario.status_pagamento !== 'GLOSADO') {
            return res.status(400).json({
                success: false,
                error: 'Apenas honorários glosados podem ter recurso',
                code: 'HONORARIO_NAO_GLOSADO'
            });
        }

        // Atualizar honorário com dados do recurso
        const honorarioAtualizado = await prisma.honorarios.update({
            where: { id: parseInt(id) },
            data: {
                recurso_enviado: true,
                status_recurso: 'PENDENTE',
                data_recurso: data_recurso ? new Date(data_recurso) : new Date(),
                motivo_recurso: motivo_recurso.trim()
            },
            include: {
                consulta: {
                    include: {
                        medico: { select: { nome_medico: true } },
                        paciente: { select: { nome_paciente: true } }
                    }
                },
                plano_saude: { select: { nome_plano: true } }
            }
        });

        // Registrar no histórico
        await prisma.historico_honorarios.create({
            data: {
                honorario_id: parseInt(id),
                tipo_evento: 'RECURSO_ENVIADO',
                descricao: `Recurso enviado contra glosa de R$ ${parseFloat(honorario.valor_glosa).toFixed(2)}`,
                dados_adicionais: {
                    motivo: motivo_recurso.trim(),
                    valor_glosa: parseFloat(honorario.valor_glosa)
                },
                usuario_id: req.user.id
            }
        });

        res.status(200).json({
            success: true,
            message: 'Recurso enviado com sucesso',
            data: { honorario: honorarioAtualizado }
        });

    } catch (error) {
        console.error('Erro ao enviar recurso:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno no servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

/*
 * ====================================================================
 * ROTA: PUT /api/honorarios/:id/recurso/status
 * DESCRIÇÃO: Atualizar status do recurso de glosa
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.put('/:id/recurso/status', authenticateToken, requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status_recurso, valor_recuperado } = req.body;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                error: 'ID do honorário inválido',
                code: 'INVALID_ID'
            });
        }

        if (!status_recurso) {
            return res.status(400).json({
                success: false,
                error: 'Status do recurso é obrigatório',
                code: 'MISSING_STATUS_RECURSO'
            });
        }

        const statusValidos = ['PENDENTE', 'ACEITO_TOTAL', 'ACEITO_PARCIAL', 'NEGADO'];
        if (!statusValidos.includes(status_recurso)) {
            return res.status(400).json({
                success: false,
                error: 'Status do recurso inválido',
                code: 'INVALID_STATUS_RECURSO',
                valid_statuses: statusValidos
            });
        }

        // Verificar se o honorário existe e tem recurso enviado
        const honorario = await prisma.honorarios.findUnique({
            where: { id: parseInt(id) }
        });

        if (!honorario) {
            return res.status(404).json({
                success: false,
                error: 'Honorário não encontrado',
                code: 'HONORARIO_NOT_FOUND'
            });
        }

        if (!honorario.recurso_enviado) {
            return res.status(400).json({
                success: false,
                error: 'Honorário não possui recurso enviado',
                code: 'SEM_RECURSO_ENVIADO'
            });
        }

        // Calcular valor recuperado baseado no status
        let valorRecuperadoFinal = 0;
        if (status_recurso === 'ACEITO_TOTAL') {
            valorRecuperadoFinal = parseFloat(honorario.valor_glosa);
        } else if (status_recurso === 'ACEITO_PARCIAL') {
            if (!valor_recuperado || valor_recuperado <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Valor recuperado é obrigatório para recurso parcialmente aceito',
                    code: 'MISSING_VALOR_RECUPERADO'
                });
            }
            valorRecuperadoFinal = parseFloat(valor_recuperado);
        }

        // Atualizar honorário
        const honorarioAtualizado = await prisma.honorarios.update({
            where: { id: parseInt(id) },
            data: {
                status_recurso,
                valor_recuperado: valorRecuperadoFinal
            },
            include: {
                consulta: {
                    include: {
                        medico: { select: { nome_medico: true } },
                        paciente: { select: { nome_paciente: true } }
                    }
                },
                plano_saude: { select: { nome_plano: true } }
            }
        });

        // Registrar no histórico
        let descricaoStatus = '';
        let detalhesStatus = {};

        if (status_recurso === 'ACEITO_TOTAL') {
            descricaoStatus = 'Recurso aceito integralmente';
            detalhesStatus = {
                status: status_recurso,
                valor_recuperado: valorRecuperadoFinal,
                mensagem: `Valor integral de R$ ${valorRecuperadoFinal.toFixed(2)} recuperado`
            };
        } else if (status_recurso === 'ACEITO_PARCIAL') {
            descricaoStatus = 'Recurso parcialmente aceito';
            detalhesStatus = {
                status: status_recurso,
                valor_recuperado: valorRecuperadoFinal,
                valor_glosa: parseFloat(honorario.valor_glosa),
                mensagem: `Valor recuperado: R$ ${valorRecuperadoFinal.toFixed(2)} de R$ ${parseFloat(honorario.valor_glosa).toFixed(2)}`
            };
        } else {
            descricaoStatus = 'Recurso negado';
            detalhesStatus = {
                status: status_recurso,
                valor_glosa: parseFloat(honorario.valor_glosa),
                mensagem: `Glosa mantida. Perda de R$ ${parseFloat(honorario.valor_glosa).toFixed(2)}`
            };
        }

        await prisma.historico_honorarios.create({
            data: {
                honorario_id: parseInt(id),
                tipo_evento: 'RECURSO_RESPONDIDO',
                descricao: descricaoStatus,
                dados_adicionais: detalhesStatus,
                usuario_id: req.user.id
            }
        });

        res.status(200).json({
            success: true,
            message: 'Status do recurso atualizado com sucesso',
            data: { honorario: honorarioAtualizado }
        });

    } catch (error) {
        console.error('Erro ao atualizar status do recurso:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno no servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

/*
 * ====================================================================
 * ROTA: GET /api/honorarios/:id/historico
 * DESCRIÇÃO: Buscar histórico de alterações de um honorário
 * ACESSO: Usuários autenticados
 * ====================================================================
 */
router.get('/:id/historico', authenticateToken, requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                error: 'ID do honorário inválido',
                code: 'INVALID_ID'
            });
        }

        // Verificar se o honorário existe
        const honorario = await prisma.honorarios.findUnique({
            where: { id: parseInt(id) }
        });

        if (!honorario) {
            return res.status(404).json({
                success: false,
                error: 'Honorário não encontrado',
                code: 'HONORARIO_NOT_FOUND'
            });
        }

        // Buscar histórico
        const historico = await prisma.historico_honorarios.findMany({
            where: { honorario_id: parseInt(id) },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome_completo: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({
            success: true,
            message: 'Histórico recuperado com sucesso',
            data: {
                honorario_id: parseInt(id),
                total_eventos: historico.length,
                historico
            }
        });

    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno no servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
