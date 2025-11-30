describe('Fluxo Principal: Consulta -> Honorário -> Pagamento', () => {

    beforeEach(() => {
        cy.login('admin@sghm.com', 'admin');
    });

    it('Deve registrar uma consulta e verificar a criação do honorário', () => {
        const timestamp = new Date().getTime();
        const protocolo = `PROT${timestamp}`;

        // 1. Registrar Consulta
        cy.visit('/consultas');
        cy.contains('Nova Consulta').click();

        // Preencher formulário
        // Assumindo que já existem pacientes e médicos no banco (ou criados no teste anterior)
        // Selecionar o primeiro paciente da lista
        cy.get('select[name="pacienteId"]').select(1);
        cy.get('input[name="protocolo"]').type(protocolo);
        cy.get('select[name="tipoLocal"]').select('Clínica Particular');
        cy.get('input[name="consultorio"]').type('Consultório Teste');
        cy.get('select[name="tipoPagamento"]').select('Convênio');

        // Selecionar o primeiro médico da lista
        cy.get('select[name="medicoId"]').select(1);

        cy.get('input[name="dataConsulta"]').type('2025-11-29');
        cy.get('input[name="valorProcedimento"]').type('200.00');

        cy.contains('button', 'Salvar Consulta').click();

        // Verificar se consulta apareceu na lista
        cy.contains(protocolo).should('be.visible');
        cy.contains('Pendente').should('be.visible');

        // 2. Verificar Honorário
        cy.visit('/honorarios');
        // O honorário deve aparecer na lista com o valor correto
        cy.contains('R$ 200.00').should('be.visible');
        cy.contains('PENDENTE').should('be.visible');
    });

    it('Deve atualizar o status do honorário para ENVIADO e depois PAGO', () => {
        cy.visit('/honorarios');

        // Encontrar um honorário PENDENTE (pode ser o criado acima)
        // Selecionar o primeiro checkbox da lista (assumindo que há itens)
        cy.get('table tbody tr').first().within(() => {
            cy.get('input[type="checkbox"]').click();
        });

        // Marcar como Enviado
        cy.contains('button', 'Marcar como Enviado').click();
        cy.on('window:confirm', () => true); // Aceitar confirmação

        // Verificar mudança de status
        cy.contains('ENVIADO').should('be.visible');

        // Selecionar novamente
        cy.get('table tbody tr').first().within(() => {
            cy.get('input[type="checkbox"]').click();
        });

        // Marcar como Pago
        cy.contains('button', 'Marcar como Pago').click();
        cy.on('window:confirm', () => true);

        // Verificar mudança de status
        cy.contains('PAGO').should('be.visible');
    });
});
