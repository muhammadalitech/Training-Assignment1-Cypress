/// <reference types ="Cypress" />

describe("E2E Flow for Khoji Application", () => {
  before(function () {
    cy.fixture("login-data").then(function (data) {
      globalThis.data = data;
    });
  });
  beforeEach(() => {
    cy.visit("/login");
    cy.url().should("include", "login");
    cy.intercept({
      path: "/quickSearchData",
    }).as("waitforquicksearchdata");
    cy.get('[data-test="email-text"]').type(data.email);
    cy.get('[data-test="password-text"]').type(data.password);
    cy.get('[data-test="login-button"]').click();
    cy.wait("@waitforquicksearchdata");
    cy.get(".topbar-breadcrumb").should("have.text", "Dashboard");
  });

  it("Visit to Analysis by Team Board through Menu cards", () => {
    cy.intercept("POST", "/stats/teamboard/bug").as("requestforbug");
    cy.intercept("POST", "/stats/teamboard/burnup").as("requestforburnup");
    cy.intercept("POST", "/alerts/teamboards").as("requestforalerts");
    cy.intercept("POST", "/stats/teamboard/issue-analysis").as(
      "requestforissueAnalysis"
    );
    cy.get('[data-test="navigation-menu-card"]')
      .contains("Delivery Analysis")
      .click();
    cy.get(".card").contains("Analysis by Team Board").click();
    cy.get('[data-test="select-button"]').click();
    cy.get('[data-test="Test team - Burnup Test-label"]').click();
    cy.get(
      '[data-test="sprint-dropdown"] > [data-test="select-button"]'
    ).click();

    cy.get('[data-test="Burnup Test - burnup-scenarios-label"]').click();

    cy.get('[data-test="submit-button"]').click();
    cy.wait([
      "@requestforbug",
      "@requestforburnup",
      "@requestforalerts",
      "@requestforissueAnalysis",
    ]);
    cy.get('[data-test="settings-icon"]').should("not.be.disabled");
  });

  it("Visit to Analysis by Release Page", () => {
    cy.intercept("GET", "/releases").as("requestforreleases");
    cy.intercept("POST", "/stats/release/epic").as("requestforEpics");
    cy.intercept("POST", "/stats/release/issue-analysis").as(
      "requestforIssueAnalysis"
    );
    cy.intercept("POST", "/stats/release/burnup").as("requestforburnupstats");
    cy.get(".p-element")
      .contains("Delivery")
      .click({ force: true })
      .get(".p-element")
      .contains("Analysis by Release")
      .click({ force: true });
    cy.url().should("include", "delivery-analysis");

    cy.get(".control.dropdown-khoji")
      .contains("Select a Release")
      .click()
      .get('[data-test="Released-arrow"]')
      .click();
    cy.get("label[title='KFA - 1.9.5.20'] input[type='checkbox']").click({
      force: true,
    });

    cy.get('[data-test="submit-button"]').click();
    cy.wait("@requestforreleases");
    cy.wait("@requestforEpics");
    cy.wait("@requestforIssueAnalysis");
    cy.wait("@requestforburnupstats");

    //cy.get('[data-test="burnup-analysis-link"]').contains('Burnup Analysis').click();
    //.click();
    cy.get("div#delivery-tracking-chart-tab.ng-star-inserted")
      .should("be.visible")
      .contains("Burnup Analysis")
      .should("exist")
      .click();

    cy.get("div#delivery-tracking-chart-tab.ng-star-inserted")
      .contains("Burnup Analysis")
      .should("exist")
      .click();

    cy.get('[data-test="burnup-details-table-button-link"]').click();

    cy.get(
      '[data-test="burnup-analysis-details-table"] > .panel-open > .panel > .panel-heading > .panel-title > .accordion-toggle > .heading > :nth-child(1) > .title > [data-test="title"]'
    ).should("have.text", "Burnup Details");
  });
  it("Visit to Analysis by WorkLog Page", () => {
    cy.intercept("POST", "/stats/team/bug").as("waitforBugs");
    cy.intercept("POST", "/alerts/teams").as("waitforAlerts");
    cy.intercept("POST", "/stats/team/issue-analysis").as(
      "waitforIssueAnalysis"
    );

    cy.get(".p-element")
      .contains("Delivery")
      .click({ force: true })
      .get(".p-element")
      .contains("Analysis by Work Log")
      .click({ force: true });

    cy.get('[data-test="select-button"]').click();
    cy.get(
      '[data-test="Test team-label"] > :nth-child(2) > :nth-child(1)'
    ).click();
    cy.get('[data-test="date-range-dropdown"]').click();
    cy.get('[data-range-key="Last 30 Days"]').click();
    cy.get('[data-test="submit-button"]').click();
    cy.url().should("include", "team");
    cy.wait(60000);
    cy.wait("@waitforBugs");
    cy.wait("@waitforAlerts");
    cy.wait("@waitforIssueAnalysis");
    cy.get('[data-test="alert-analysis-link"]').click();
    cy.get('[data-test="settings-icon"]').should("not.be.disabled");
  });

  it("Visit to Team WorkLog Page", () => {
    cy.intercept({
      path: "/getWorkLog",
    }).as("waitforTeamsWorkLogData");
    cy.get(".layout-root-menuitem > .p-element").contains("Work Log").click();

    cy.get('[data-test="select-button"]')
      .click()
      .get('[data-test="Test team-label"]')
      .click()
      .get('[data-test="Test team2-label"]')
      .click();
    cy.get('[data-test="date-range-dropdown"]')
      .click()
      .get('[data-range-key="Last 30 Days"]')
      .click();
    cy.get('[data-test="submit-button"]').click();
    cy.wait("@waitforTeamsWorkLogData");
    cy.get(
      '[data-test="team-worklog-analysis-logged-time-percentage-graph"]'
    ).should("be.visible");

    cy.get('[data-test="show-filter-button"]').click();
    //cy.get('[data-test="select-button"]').click()
    cy.get(
      '[data-test="worklog-team-dropdown"] > [data-test="select-button"] > [data-test="arrow-icon"]'
    ).click();
    // cy.get('[data-test="select-button"]').click()
    cy.get('[data-test="Test team-label"]').click();
    cy.get('[data-test="date-range-dropdown"]')
      .click()
      .get('[data-range-key="Last 30 Days"]')
      .click();
    cy.get('[data-test="submit-button"]').click();
    cy.wait("@waitforTeamsWorkLogData");
    // cy.get('[data-test="team-worklog-analysis-logged-time-percentage-graph"]').should("not.be.visible");
  });
  it("Visit to Team Progress Report page", () => {
    cy.intercept("POST", "/alerts/teamboards").as("requestforalerts");
    cy.intercept("POST", "/stats/teamboard/issue-analysis").as(
      "requestforIssueAnalysis"
    );
    cy.intercept("POST", "/stats/teamboard/bug").as("requestforBugs");
    cy.intercept("POST", "/alerts/teamboards/issues").as("requestforIssues");

    cy.get(".p-element")
      .contains("Reports")
      .click()
      .get(".p-element")
      .contains("Team Progress Report")
      .click();
    cy.get('[data-test="teamboard-dropdown"]').click();
    cy.get('[data-test="Test team - Burnup Test-label"]')
      .click()
      .get('[data-test="sprint-dropdown"]')
      .click();
    cy.get('[data-test="Closed-arrow"]').click();
    cy.get('[data-test="Burnup Test - KT-Sprint 5-label"]')
      .click()
      .get('[data-test="submit-button"]')
      .click();
    cy.wait("@requestforalerts");
    cy.wait("@requestforIssueAnalysis");
    cy.wait("@requestforBugs");
    cy.wait("@requestforIssues");
    cy.get('[data-test="velocity-throughput-analysis-graph"]').should(
      "be.visible"
    );
  });

  it("Visit to Release Report page", () => {
    cy.intercept("GET", "/releases").as("requestforReleases");
    cy.intercept("POST", "/stats/release/epic").as("requestforEpics");
    cy.intercept("POST", "/stats/release/burnup").as("requestforBurnUp");
    cy.intercept("POST", "/stats/release/burnup/issues").as("requestforIssues");
    cy.intercept("POST", "/stats/release/issue-analysis").as(
      "requestforIssuesAnalysis"
    );
    cy.intercept("POST", "/stats/release/bug").as("requestforBugs");

    cy.get(".p-element")
      .contains("Reports")
      .click()
      .get(".p-element")
      .contains("Release Report")
      .click();
    // cy.wait(40000)
    cy.get('[data-test="release-dropdown"]').click();
    cy.get('[data-test="KFA - 1.9-label"]').click();
    cy.get('[data-test="submit-button"]').click();

    //cy.wait(40000)

    cy.wait("@requestforReleases");
    cy.wait("@requestforBugs");
    cy.wait("@requestforEpics");
    cy.wait("@requestforBurnUp");
    cy.wait("@requestforIssues");
    cy.wait("@requestforIssuesAnalysis");
    cy.get(".reliability-trans").should("have.text", " Data Reliability: ");
  });
  it("Visit to Indicators Summary by Team Board", () => {
    cy.intercept({
      path: "/stats/indicatorsSummary",
    }).as("requestforIndicatorsSummary");
    cy.get(".p-element")
      .contains("Reports")
      .click()
      .get(".p-element")
      .contains("Indicators Summary by Team Board")
      .click();
    cy.wait(10000);
    cy.get(
      '[data-test="teamboard-dropdown"] > [data-test="select-button"]'
    ).click();
    cy.get('[data-test="Test team - Burnup Test-label"]').click();
    cy.get('[data-test="date-range-dropdown"]').click();
    cy.get('[data-range-key="Last 30 Days"]').click();
    cy.get('[data-test="submit-button"]').click();
    cy.wait("@requestforIndicatorsSummary");
    cy.get('[data-test="indicator-setting-icon"]').should("not.be.disabled");
  });
  it("Logout from khoji Application", () => {
    cy.get('[data-test="profile-menu-button"]').click();
    cy.get('[data-test="signout-button"]').click();
    cy.url().should("include", "login");
  });
});
