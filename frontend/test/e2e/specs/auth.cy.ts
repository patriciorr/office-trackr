// TODO: Add more comprehensive tests for the authentication flow, including password reset and account lockout scenarios.
describe('Authentication', () => {
  it('shows an error for invalid credentials', () => {
    cy.visit('/');
    cy.get('input[type="email"]').type('johndoe@test.com');
    cy.get('input[type="password"]').type('WrongPassword1!');
    cy.contains('button', 'Entrar').click();

    cy.contains('Credenciales inválidas').should('be.visible');
  });

  it('logs a seeded coworker in and shows the calendar', () => {
    cy.visit('/');
    cy.get('input[type="email"]').type('johndoe@test.com');
    cy.get('input[type="password"]').type('Patricio@123');
    cy.contains('button', 'Entrar').click();

    cy.contains('Resumen mensual').should('be.visible');
    cy.contains('Calendario').should('be.visible');
  });
});
