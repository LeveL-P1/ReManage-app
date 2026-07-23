import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { getResidentMoreFeatureOrThrow } from "./resident-more-feature-catalog";
import { ResidentMoreFeatureScreen } from "./resident-more-feature-screen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe("ResidentMoreFeatureScreen", () => {
  beforeEach(() => mockBack.mockReset());

  it("renders a truthful service preview and returns to More", async () => {
    const screen = await render(
      <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("helpdesk")} />,
    );

    expect(screen.getByRole("header", { name: "Helpdesk" })).toBeTruthy();
    expect(screen.getByText("This is a guided mobile preview.")).toBeTruthy();
    expect(screen.getByText("Raise a clear service request")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Back" }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
