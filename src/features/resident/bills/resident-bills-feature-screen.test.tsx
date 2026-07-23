import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { ResidentBillsFeatureScreen } from "./resident-bills-feature-screen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("ResidentBillsFeatureScreen", () => {
  beforeEach(() => mockBack.mockReset());

  it("renders an honest payment pop-out and closes back to Bills", async () => {
    const screen = await render(<ResidentBillsFeatureScreen featureId="pay-now" />);

    expect(screen.getAllByText("Pay society dues")).toHaveLength(2);
    expect(screen.getByText("This is a guided mobile preview; it does not initiate a live payment.")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Close Pay society dues" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
