import {
  getResidentMoreFeature,
  residentMoreFeatures,
} from "./resident-more-feature-catalog";

describe("residentMoreFeatures", () => {
  it("maps every non-tab resident service to a static More pop-out", () => {
    expect(getResidentMoreFeature("helpdesk")?.route).toBe("/(resident)/more/helpdesk");
    expect(getResidentMoreFeature("documents")?.highlights).toHaveLength(3);
    expect(getResidentMoreFeature("my-bills")).toBeNull();
    expect(getResidentMoreFeature("my-visitors")).toBeNull();
    expect(residentMoreFeatures).toHaveLength(16);
  });
});
