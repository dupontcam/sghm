describe('Gestão de Glosas e Recursos', () => {
    const timestamp = new Date().getTime();
    const protocolo = `GLOSA${timestamp}`;

    beforeEach(() => {
        cy.login('admin@sghm.com', 'admin');
        cy.wait(2000); // Wait for initial data load
    });

    it('Deve registrar uma glosa, enviar recurso e aceitar', () => {
        // 1. Criar uma nova consulta para garantir que temos um honorário PENDENTE
        cy.visit('/consultas');
        cy.wait(1000);
        cy.get('[data-testid="btn-nova-consulta"]').click();

        // Preencher formulário
        // Selecionar paciente pelo texto para garantir
        cy.get('[data-testid="select-paciente"]').select('Ana Silva');
        cy.wait(1000); // Wait for plan auto-selection
        cy.get('[data-testid="input-protocolo"]').type(protocolo);
        cy.get('[data-testid="select-tipo-local"]').select('Hospital Particular');
        cy.get('[data-testid="input-consultorio"]').type('Hospital Central');
        cy.get('[data-testid="select-tipo-pagamento"]').select('Convênio');
        cy.get('[data-testid="select-medico"]').select(1); // Dr. Carlos Alberto
        cy.get('[data-testid="input-data-consulta"]').type('2025-11-30');
        cy.get('[data-testid="btn-salvar-consulta"]').click();

        // 2. Ir para Gestão de Honorários
        cy.visit('/honorarios');
        cy.wait(2000); // Wait for list to load

        // 3. Registrar Glosa
        // Selecionar o honorário pelo protocolo (que é o número da guia)
        cy.contains('tr', protocolo).within(() => {
            cy.get('[type="checkbox"]').check();
        });

        cy.get('[data-testid="btn-registrar-glosa"]').click();
        cy.get('[data-testid="input-motivo-glosa"]').type('Glosa por falta de documentação');
        cy.get('[data-testid="btn-confirmar-glosa"]').click();

        // Verificar status GLOSADO
        cy.wait(1000); // Wait for update
        cy.contains('tr', protocolo).within(() => {
            cy.should('contain', 'GLOSADO');
            // 4. Enviar Recurso
            cy.get('[data-testid^="btn-enviar-recurso-"]').click();
        });

        // Preencher modal de recurso
        cy.get('[data-testid="input-data-recurso"]').type('2025-12-01');
        cy.get('[data-testid="input-motivo-recurso"]').type('Documentação enviada em anexo.');
        cy.get('[data-testid="btn-confirmar-recurso"]').click();

        // Verificar status RECURSO_ENVIADO (ou ícone correspondente)
        cy.wait(1000); // Wait for update
        cy.contains('tr', protocolo).within(() => {
            cy.get('[data-testid^="btn-atualizar-status-recurso-"]').should('be.visible');
            // 5. Atualizar Status do Recurso (Aceitar)
            cy.get('[data-testid^="btn-atualizar-status-recurso-"]').click();
        });

        // Modal de atualização de status
        cy.get('[data-testid="select-status-recurso"]').select('ACEITO_TOTAL');
        cy.get('[data-testid="btn-confirmar-status-recurso"]').click();

        // Verificar status ACEITO_TOTAL
        cy.wait(1000); // Wait for update
        cy.contains('tr', protocolo).within(() => {
            cy.should('contain', 'Aceito');
        });
    });
});
