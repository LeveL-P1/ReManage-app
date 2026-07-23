import {
  getResidentVisitorFeature,
  residentVisitorsFixture,
  residentVisitorQuickActionIds,
} from "./resident-visitors-feature-catalog";

describe("resident visitor feature catalog", () => {
  it("maps every quick visitor action to a stable resident stack route", () => {
    expect(residentVisitorQuickActionIds).toEqual([
      "pre-approve",
      "invite-guest",
      "daily-help",
      "history",
    ]);
    expect(getResidentVisitorFeature("invite-guest").route).toBe("/(resident)/visitors/invite-guest");
    expect(getResidentVisitorFeature("history").route).toBe("/(resident)/visitors/history");
  });

  it("provides a deterministic arrival-first visitor fixture", () => {
    expect(residentVisitorsFixture.expectedVisitors).toHaveLength(2);
    expect(residentVisitorsFixture.summary.expectedCount).toBe("2");
    expect(residentVisitorsFixture.activity).toHaveLength(2);
  });
});
