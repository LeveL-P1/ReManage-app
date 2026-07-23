import {
  getResidentBillsFeature,
  residentBillsFixture,
  residentBillsQuickActionIds,
} from "./resident-bills-feature-catalog";

describe("resident Bills feature catalog", () => {
  it("maps payment actions to stable resident stack routes", () => {
    expect(residentBillsQuickActionIds).toEqual([
      "pay-now",
      "invoices",
      "history",
      "help",
    ]);
    expect(getResidentBillsFeature("pay-now").route).toBe("/(resident)/bills/pay-now");
    expect(getResidentBillsFeature("invoices").route).toBe("/(resident)/bills/invoices");
  });

  it("provides a deterministic current-dues and invoice fixture", () => {
    expect(residentBillsFixture.currentDues.amount).toBe("₹3,480");
    expect(residentBillsFixture.latestInvoice.id).toBe("july-2026");
    expect(residentBillsFixture.activity).toHaveLength(2);
  });
});
