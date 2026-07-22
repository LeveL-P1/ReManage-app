import {
  RESIDENT_DEMO_PERMISSIONS,
  RESIDENT_MODULES,
  filterResidentModules,
  groupResidentModules,
} from "./resident-module-catalog";

describe("Resident module catalog", () => {
  it("contains every approved ReManage Resident module exactly once", () => {
    expect(RESIDENT_MODULES.map(({ id }) => id)).toEqual([
      "my-bills",
      "my-visitors",
      "helpdesk",
      "sos",
      "announcements",
      "parcels",
      "forum",
      "events",
      "amenities",
      "marketplace",
      "parking",
      "directory",
      "staff",
      "society-noc",
      "meetings",
      "polls",
      "documents",
      "move-in-out",
    ]);
    expect(new Set(RESIDENT_MODULES.map(({ id }) => id)).size).toBe(
      RESIDENT_MODULES.length,
    );
  });

  it("shows approved Resident modules but not permission-dependent move-in/out", () => {
    const visible = filterResidentModules(RESIDENT_DEMO_PERMISSIONS);

    expect(visible.map(({ id }) => id)).not.toContain("move-in-out");
    expect(visible).toHaveLength(17);
  });

  it("shows move-in/out only with tenant membership permission", () => {
    expect(
      filterResidentModules([
        ...RESIDENT_DEMO_PERMISSIONS,
        "tenant:membership.read",
      ]).map(({ id }) => id),
    ).toContain("move-in-out");
  });

  it("keeps privileged permissions out of the Resident demo", () => {
    expect(RESIDENT_DEMO_PERMISSIONS).not.toEqual(
      expect.arrayContaining([
        "operations:gate.manage",
        "society:finance.manage",
        "community:notice.manage",
      ]),
    );
  });

  it("groups modules in daily, community, governance order", () => {
    expect(
      groupResidentModules(
        filterResidentModules(RESIDENT_DEMO_PERMISSIONS),
      ).map(({ id }) => id),
    ).toEqual(["daily", "community", "governance"]);
  });
});
