/// <reference types="cypress" />

describe('CRUD Básico: Médicos, Pacientes e Planos', () => {

    beforeEach(() => {
        cy.login('admin@sghm.com', 'admin');
    });

    it('Deve criar um novo médico', () => {
        const timestamp = new Date().getTime();
        const nomeMedico = `Médico Teste ${timestamp}`;
        const crm = `CRM${timestamp}`;

        cy.visit('/medicos');
        cy.get('[data-testid="btn-novo-medico"]').click();

        cy.get('[data-testid="input-nome"]').type(nomeMedico);
        cy.get('[data-testid="input-crm"]').type(crm);
        cy.get('[data-testid="input-especialidade"]').type('Cardiologia');
        cy.get('[data-testid="input-email"]').type(`medico${timestamp}@teste.com`);
        cy.get('[data-testid="input-cpf"]').type('123.456.789-00'); // CPF obrigatório
        cy.get('[data-testid="input-telefone"]').type('(11) 99999-9999');

        cy.get('[data-testid="btn-salvar"]').click();

        cy.contains(nomeMedico).should('be.visible');

        // Editar
        cy.contains('tr', nomeMedico).within(() => {
            cy.get('[data-testid^="btn-editar-medico-"]').click();
        });
        cy.get('[data-testid="input-nome"]').clear().type(`${nomeMedico} Editado`);
        cy.get('[data-testid="btn-salvar"]').click();
        cy.contains(`${nomeMedico} Editado`).should('be.visible');

        // Excluir
        cy.contains('tr', `${nomeMedico} Editado`).within(() => {
            cy.get('[data-testid^="btn-excluir-medico-"]').click();
        });
        cy.get('[data-testid="btn-confirmar-exclusao"]').click();
        cy.contains(`${nomeMedico} Editado`).should('not.exist');
    });

    it('Deve criar um novo paciente', () => {
        const timestamp = new Date().getTime();
        const nomePaciente = `Paciente Teste ${timestamp}`;
        const cpf = `${timestamp}`.substring(0, 11); // Mock CPF simples

        cy.visit('/pacientes');
        cy.get('[data-testid="btn-novo-paciente"]').click();

        cy.get('[data-testid="input-nome"]').type(nomePaciente);
        cy.get('[data-testid="input-cpf"]').type(cpf);
        cy.get('[data-testid="input-email"]').type(`paciente${timestamp}@teste.com`);
        cy.get('[data-testid="input-telefone"]').type('(11) 99999-9999');
        // Se houver select de convênio, pode ser necessário selecionar
        // cy.get('[data-testid="select-convenio"]').select('Unimed'); 

        cy.get('[data-testid="btn-salvar"]').click();

        cy.contains(nomePaciente).should('be.visible');

        // Editar
        cy.contains('tr', nomePaciente).within(() => {
            cy.get('[data-testid^="btn-editar-paciente-"]').click();
        });
        cy.get('[data-testid="input-nome"]').clear().type(`${nomePaciente} Editado`);
        cy.get('[data-testid="btn-salvar"]').click();
        cy.contains(`${nomePaciente} Editado`).should('be.visible');

        // Excluir
        cy.contains('tr', `${nomePaciente} Editado`).within(() => {
            cy.get('[data-testid^="btn-excluir-paciente-"]').click();
        });
        cy.get('[data-testid="btn-confirmar-exclusao"]').click();
        cy.contains(`${nomePaciente} Editado`).should('not.exist');
    });

    it('Deve criar um novo plano de saúde', () => {
        const timestamp = new Date().getTime();
        const nomePlano = `Plano Teste ${timestamp}`;

        cy.visit('/planos-saude');
        cy.get('[data-testid="btn-novo-plano"]').click();

        cy.get('[data-testid="input-nome-plano"]').type(nomePlano);
        cy.get('[data-testid="input-valor-consulta"]').clear().type('150.00');

        cy.get('[data-testid="btn-salvar-plano"]').click();

        cy.contains(nomePlano).should('be.visible');

        // Editar
        cy.contains(nomePlano).parents('[data-testid^="card-plano-"]').within(() => {
            cy.get('[data-testid^="btn-editar-plano-"]').click();
        });
        cy.get('[data-testid="input-nome-plano"]').clear().type(`${nomePlano} Editado`);
        cy.get('[data-testid="btn-salvar-plano"]').click();
        cy.contains(`${nomePlano} Editado`).should('be.visible');

        // Excluir
        cy.contains(`${nomePlano} Editado`).parents('[data-testid^="card-plano-"]').within(() => {
            cy.get('[data-testid^="btn-excluir-plano-"]').click();
        });
        cy.get('[data-testid="btn-confirmar-exclusao"]').click();
        cy.contains(`${nomePlano} Editado`).should('not.exist');
    });
});
