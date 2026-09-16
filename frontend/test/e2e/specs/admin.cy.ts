// TODO: Add more comprehensive tests for the admin panel, including role management and permission checks.
describe('Admin panel', () => {
  beforeEach(() => {
    cy.loginByApi('admin@test.com', 'Patricio@123');
    cy.visit('/');
    cy.contains('button', 'Panel de Administración').click();
  });

  it('lists the seeded users and edits a name', () => {
    cy.contains('janedoe@test.com').should('be.visible');

    cy.contains('tr', 'janedoe@test.com').within(() => {
      cy.get('button[aria-label="Editar usuario"]').click();
    });

    cy.get('input[value="Jane"]').clear().type('Janet');
    cy.contains('button', 'Guardar').click();

    cy.contains('tr', 'janedoe@test.com').should('contain.text', 'Janet');
  });

  it('deletes a user after confirmation', () => {
    cy.contains('tr', 'janedoe@test.com').within(() => {
      cy.get('button[aria-label="Eliminar usuario"]').click();
    });

    cy.contains('button', 'Eliminar').click();

    cy.contains('janedoe@test.com').should('not.exist');
  });
});
