export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Logs in via the real API and injects the session into localStorage, bypassing the login form. */
      loginByApi(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request('POST', 'http://localhost:5000/api/auth/login', {email, password}).then(({body}) => {
    window.localStorage.setItem('token', body.token);
    window.localStorage.setItem('user', JSON.stringify(body.user));
  });
});
