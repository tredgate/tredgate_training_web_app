import { describe, it, expect } from "vitest";
import { en } from "./en";
import { t } from "./index";

describe("i18n", () => {
  it("t equals en", () => {
    expect(t).toBe(en);
  });

  it("has required top-level keys", () => {
    const keys = [
      "app",
      "common",
      "login",
      "sidebar",
      "dashboard",
      "defects",
      "defectDetail",
      "defectForm",
      "projects",
      "projectDetail",
      "projectForm",
      "testPlans",
      "testPlanDetail",
      "testPlanForm",
      "testRunExecution",
      "team",
      "reports",
      "settings",
      "profile",
    ];
    keys.forEach((k) => expect(en).toHaveProperty(k));
  });

  it("app.name is correct", () => {
    expect(t.app.name).toBe("TredGate QA Hub");
  });

  it("login.signIn is correct", () => {
    expect(t.login.signIn).toBe("Sign In");
  });

  it("dashboard.statTotalDefects is correct", () => {
    expect(t.dashboard.statTotalDefects).toBe("Total Defects");
  });

  it("resultsPassed is a function that formats correctly", () => {
    expect(t.dashboard.resultsPassed(3, 5)).toBe("3/5 passed");
  });

  it("defects.membersCount formats correctly", () => {
    expect(t.projects.membersCount(4)).toBe("4 members");
  });

  it("testRunExecution.progressLabel formats correctly", () => {
    expect(t.testRunExecution.progressLabel(2, 5)).toBe("Case 2 of 5");
  });

  it("testRunExecution.progressComplete formats correctly", () => {
    expect(t.testRunExecution.progressComplete(75)).toBe("75% complete");
  });

  it("reports.defectsCountLabel formats correctly", () => {
    expect(t.reports.defectsCountLabel(3)).toBe("3 defects");
  });

  it("settings.toastExportSuccess formats correctly", () => {
    expect(t.settings.toastExportSuccess("backup.json")).toBe(
      "Data exported as backup.json",
    );
  });

  it("no top-level key is undefined", () => {
    Object.values(en).forEach((section) => {
      expect(section).toBeDefined();
    });
  });
});
