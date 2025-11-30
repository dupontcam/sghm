describe('Autenticação e Permissões', () => {

    it('Deve fazer login como Admin com sucesso', () => {
        cy.visit('/login');
        cy.get('[data-testid="input-email"]').type('admin@sghm.com');
        cy.get('[data-testid="input-password"]').type('admin');
        cy.get('[data-testid="btn-entrar"]').click();

        cy.url().should('include', '/dashboard');
    });

    it('Deve falhar ao fazer login com credenciais inválidas', () => {
        cy.visit('/login');
        cy.get('[data-testid="input-email"]').type('errado@sghm.com');
        cy.get('[data-testid="input-password"]').type('senhaerrada');
        cy.get('[data-testid="btn-entrar"]').click();

        cy.contains('Erro ao fazer login').should('be.visible');
        cy.url().should('include', '/login');
    });

    it('Deve fazer logout corretamente', () => {
        cy.login('admin@sghm.com', 'admin');
        cy.get('[data-testid="btn-sair"]').click();
        cy.url().should('include', '/login');
    });
});
