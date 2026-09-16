// TODO: Add more comprehensive tests for the calendar functionality, including recurring events and edge cases.
describe('Calendar events', () => {
  beforeEach(() => {
    cy.loginByApi('johndoe@test.com', 'Patricio@123');
    cy.visit('/');
    cy.contains('Resumen mensual').should('be.visible');
  });

  it('creates and then deletes an office day, updating the monthly counter', () => {
    cy.contains(/Días de oficina: 0/).should('be.visible');

    // Pick a day far in the past/future-independent way: the first enabled gridcell in the visible month.
    cy.get('.MuiPickersDay-root:not(.Mui-disabled)').first().click();
    cy.contains('button', 'Oficina').click();

    cy.contains(/Días de oficina: 1/).should('be.visible');

    cy.contains('button', 'Eliminar').click();
    cy.contains(/Días de oficina: 0/).should('be.visible');
  });
});
