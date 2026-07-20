import React from "react";
import { render } from "@testing-library/react-native";
import { AppState } from "react-native";

declare function require(moduleName: string): unknown;

const mockNetInfoUnsubscribe = jest.fn();
type NetworkListener = (state: { isConnected: boolean | null }) => void;

const mockNetInfoSubscribe = jest.fn((_listener: NetworkListener) => mockNetInfoUnsubscribe);
const mockSetOnline = jest.fn();
const mockFocus = jest.fn();
const mockAppStateRemove = jest.fn();
const mockAppStateSubscribe = jest.fn(() => ({ remove: mockAppStateRemove }));

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: { addEventListener: mockNetInfoSubscribe },
}));

jest.mock("@tanstack/react-query", () => ({
  onlineManager: { setOnline: mockSetOnline },
  focusManager: { setFocused: mockFocus },
}));

const { ReactNativeQueryLifecycle } = require("./react-native-query-lifecycle") as typeof import("./react-native-query-lifecycle");

describe("ReactNativeQueryLifecycle", () => {
  let appStateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    appStateSpy = jest.spyOn(AppState, "addEventListener").mockImplementation(mockAppStateSubscribe as never);
  });

  afterEach(() => appStateSpy.mockRestore());

  it("subscribes to NetInfo and cleans up both native listeners", async () => {
    const rendered = await render(<ReactNativeQueryLifecycle />);

    expect(mockNetInfoSubscribe).toHaveBeenCalledTimes(1);
    const networkListener = (mockNetInfoSubscribe.mock.calls as unknown as [NetworkListener][])[0]?.[0];
    if (!networkListener) throw new Error("NetInfo listener was not registered.");
    networkListener({ isConnected: true });
    expect(mockSetOnline).toHaveBeenCalledWith(true);
    expect(mockAppStateSubscribe).toHaveBeenCalledWith("change", expect.any(Function));

    await rendered.unmount();

    expect(mockNetInfoUnsubscribe).toHaveBeenCalledTimes(1);
    expect(mockAppStateRemove).toHaveBeenCalledTimes(1);
  });
});
