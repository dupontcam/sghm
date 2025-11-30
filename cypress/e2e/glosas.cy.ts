describe('Gestão de Glosas e Recursos', () => {

    beforeEach(() => {
        cy.login('admin@sghm.com', 'admin');
    });

    it('Deve registrar uma glosa, enviar recurso e aceitar', () => {
        // 1. Criar uma nova consulta para garantir que temos um honorário PENDENTE
        const timestamp = new Date().getTime();
        const protocolo = `GLOSA${timestamp}`;

        cy.visit('/consultas');
        cy.contains('Nova Consulta').click();

        // Preencher formulário
        cy.get('select[name="pacienteId"]').select(1);
        cy.get('input[name="protocolo"]').type(protocolo);
        cy.get('select[name="tipoLocal"]').select('Clínica Particular');
        cy.get('input[name="consultorio"]').type('Consultório Teste Glosa');
        cy.get('select[name="tipoPagamento"]').select('Convênio');
        cy.get('select[name="medicoId"]').select(1);
        cy.get('input[name="dataConsulta"]').type('2025-11-30');
        cy.get('input[name="valorProcedimento"]').type('300.00');

        cy.contains('button', 'Salvar Consulta').click();
    });

    // 4. Atualizar Status do Recurso
    cy.contains('tr', '300.00').within(() => {
        cy.get('button[title="Atualizar Status do Recurso"]').click();
    });

    // Modal já vem com "ACEITO_TOTAL" por padrão
    cy.contains('button', 'Confirmar').click();

    // Verificar badge de status
    cy.contains('tr', '300.00').should('contain', 'Aceito');
});
});
