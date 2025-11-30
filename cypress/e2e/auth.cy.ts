describe('Autenticação e Permissões', () => {

    it('Deve fazer login como Admin com sucesso', () => {
        it('Deve fazer login como Operador com sucesso', () => {
            cy.get('input[name="email"]').type('errado@sghm.com');
            cy.get('input[name="password"]').type('senhaerrada');
            cy.get('button[type="submit"]').click();

            cy.contains('Erro ao fazer login').should('be.visible');
            cy.url().should('include', '/login');
        });

        it('Deve fazer logout corretamente', () => {
            cy.login('admin@sghm.com', 'admin');
            cy.get('button[title="Sair"]').click(); // Ajuste o seletor conforme seu botão de logout
            cy.url().should('include', '/login');
        });
    });
