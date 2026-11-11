// TODO: Add more comprehensive tests for the calendar functionality, including recurring events and edge cases.
describe('Calendar events', () => {
  beforeEach(() => {
    cy.loginByApi('johndoe@test.com', 'Patricio@123');
    cy.visit('/');
    cy.contains('Resumen mensual').should('be.visible');
  });

  it('creates and then deletes an office day, updating the monthly counter', () => {
    cy.contains(/Días de oficina: 0/).should('be.visible');

    const today = new Date();
    const workday = new Date(today.getFullYear(), today.getMonth(), 1);
    while (workday.getDay() === 0 || workday.getDay() === 6 || workday.getDate() === today.getDate()) {
      workday.setDate(workday.getDate() + 1);
    }
    cy.get('button.MuiPickersDay-root:not(:disabled)')
      .contains(new RegExp(`^${workday.getDate()}$`))
      .click();
    cy.contains('button', 'Oficina').click();

    cy.contains(/Días de oficina: 1/).should('be.visible');

    cy.contains('button', 'Eliminar').click();
    cy.contains(/Días de oficina: 0/).should('be.visible');
  });
});
