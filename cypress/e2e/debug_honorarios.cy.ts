describe('Debug Honorarios', () => {
    beforeEach(() => {
        cy.login('admin@sghm.com', 'admin');
        cy.wait(2000);
    });

    it('Deve listar honorarios', () => {
        cy.visit('/honorarios');
        cy.wait(2000);
        cy.get('table tbody tr').should('have.length.gt', 0);
        cy.get('table tbody tr').last().then($row => {
            cy.log('Last row text: ' + $row.text());
        });
    });
});
