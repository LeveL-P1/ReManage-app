import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { ResidentVisitorsFeatureScreen } from "./resident-visitors-feature-screen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("ResidentVisitorsFeatureScreen", () => {
  beforeEach(() => mockBack.mockReset());

  it("renders an honest visitor pop-out and closes back to the tab", async () => {
    const screen = await render(<ResidentVisitorsFeatureScreen featureId="invite-guest" />);

    expect(screen.getAllByText("Invite Guest")).toHaveLength(2);
    expect(screen.getByText("This is a guided mobile preview; it does not create a live gate invitation.")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Close Invite Guest" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
