import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { RESIDENT_MODULES } from "@/features/resident/catalog/resident-module-catalog";
import { ResidentFeedbackSheet } from "./resident-feedback-sheet";

describe("ResidentFeedbackSheet", () => {
  it("describes an unfinished module and dismisses accessibly", async () => {
    const onDismiss = jest.fn();
    const helpdesk = RESIDENT_MODULES.find(({ id }) => id === "helpdesk")!;
    const screen = await render(<ResidentFeedbackSheet module={helpdesk} onDismiss={onDismiss} />);

    expect(screen.getByText("Helpdesk")).toBeTruthy();
    expect(screen.getByText("Complaints, requests, and issue tracking")).toBeTruthy();
    expect(screen.getByText("This mobile module is coming in the next ReManage phase.")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Close module details" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
