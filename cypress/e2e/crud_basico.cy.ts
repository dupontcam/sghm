describe('CRUD Básico: Médicos, Pacientes e Planos', () => {

    beforeEach(() => {
        cy.login('admin@sghm.com', 'admin');
    });

    it('Deve criar um novo médico', () => {
        const timestamp = new Date().getTime();
        const nomeMedico = `Médico Teste ${timestamp}`;
        const crm = `CRM${timestamp}`;

        cy.visit('/medicos');
        cy.contains('Novo Médico').click();

        cy.get('input[name="nome"]').type(nomeMedico);
        cy.get('input[name="crm"]').type(crm);
        cy.get('input[name="especialidade"]').type('Cardiologia');
        cy.get('input[name="email"]').type(`medico${timestamp}@teste.com`);

        cy.contains('button', 'Salvar').click();

        cy.contains(nomeMedico).should('be.visible');
    });

    it('Deve criar um novo paciente', () => {
        const timestamp = new Date().getTime();
        const nomePaciente = `Paciente Teste ${timestamp}`;
        const cpf = `${timestamp}`.substring(0, 11); // Mock CPF simples

        cy.visit('/pacientes');
        cy.contains('Novo Paciente').click();

        cy.get('input[name="nome"]').type(nomePaciente);
        cy.get('input[name="cpf"]').type(cpf);
        cy.get('input[name="email"]').type(`paciente${timestamp}@teste.com`);

        cy.contains('button', 'Salvar').click();

        cy.contains(nomePaciente).should('be.visible');
    });

    it('Deve criar um novo plano de saúde', () => {
        const timestamp = new Date().getTime();
        const nomePlano = `Plano Teste ${timestamp}`;

        cy.visit('/planos-saude');
        cy.contains('Novo Plano').click();

        cy.get('input[name="nome"]').type(nomePlano);

        cy.contains('button', 'Salvar').click();

        cy.contains(nomePlano).should('be.visible');
    });
});
