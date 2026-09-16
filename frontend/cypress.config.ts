import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "test/e2e/specs/**/*.cy.ts",
    supportFile: "test/e2e/support/e2e.ts",
    fixturesFolder: "test/e2e/fixtures",
    video: false,
    defaultCommandTimeout: 10000,
  },
});
