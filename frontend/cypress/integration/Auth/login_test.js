it.only("login test", function () {
  cy.visit("/login");
  if (cy.get('[data-test="login-form"]').length > 0) {
    console.log("login button is present");
  }
  cy.get('[data-test="email-form-control"]').type("user1@gmail.com");
  cy.get('[data-test="password-form-control"]').type("user1");
  cy.get('[data-test="login-button"]').click();
  cy.wait(2000);
});

it.only("login test fail", function () {
  cy.visit("/login");
  if (cy.get('[data-test="login-form"]').length > 0) {
    console.log("login button is present");
  }

  cy.get('[data-test="email-form-control"]').type("user1@gmail.com");
  cy.get('[data-test="password-form-control"]').type("user2");
  cy.get('[data-test="login-button"]').click();
  cy.wait(2000);
});
