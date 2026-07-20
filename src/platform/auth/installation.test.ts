import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

import type { CredentialStore } from "./credential-store";
import { getOrCreateInstallation } from "./installation";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { version: "1.0.0" } },
}));

jest.mock("expo-crypto", () => ({ randomUUID: jest.fn() }));

jest.mock("expo-device", () => ({ deviceName: "Pixel 9" }));

function fakeCredentialStore(storedId: string | null): CredentialStore {
  return {
    getRenewableCredential: async () => null,
    setRenewableCredential: async () => undefined,
    clearCredentials: async () => undefined,
    getInstallationId: jest.fn(async () => storedId),
    setInstallationId: jest.fn(async () => undefined),
    purgeDeviceState: async () => undefined,
  };
}

function setPlatformOs(os: string): void {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
}

describe("getOrCreateInstallation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setPlatformOs("android");
    Constants.expoConfig = { version: "1.0.0" } as typeof Constants.expoConfig;
    Object.defineProperty(Device, "deviceName", { configurable: true, value: "Pixel 9" });
  });

  it("reuses the stored UUID without generating or replacing it", async () => {
    const store = fakeCredentialStore("stored-installation-id");

    await expect(getOrCreateInstallation(store)).resolves.toEqual({
      id: "stored-installation-id",
      platform: "android",
      appVersion: "1.0.0",
      deviceName: "Pixel 9",
    });

    expect(Crypto.randomUUID).not.toHaveBeenCalled();
    expect(store.setInstallationId).not.toHaveBeenCalled();
  });

  it("generates and protects a UUID only when no installation ID exists", async () => {
    const store = fakeCredentialStore(null);
    (Crypto.randomUUID as jest.Mock).mockReturnValue("generated-installation-id");
    setPlatformOs("ios");
    Constants.expoConfig = { version: "1.2.3" } as typeof Constants.expoConfig;

    await expect(getOrCreateInstallation(store)).resolves.toEqual({
      id: "generated-installation-id",
      platform: "ios",
      appVersion: "1.2.3",
      deviceName: "Pixel 9",
    });

    expect(Crypto.randomUUID).toHaveBeenCalledTimes(1);
    expect(store.setInstallationId).toHaveBeenCalledWith("generated-installation-id");
  });

  it("omits an unavailable device name", async () => {
    const store = fakeCredentialStore("stored-installation-id");
    Object.defineProperty(Device, "deviceName", { configurable: true, value: null });

    await expect(getOrCreateInstallation(store)).resolves.toEqual({
      id: "stored-installation-id",
      platform: "android",
      appVersion: "1.0.0",
    });
  });

  it.each(["web", "windows", "macos"])("rejects unsupported runtime platform %s", async (os) => {
    const store = fakeCredentialStore(null);
    setPlatformOs(os);

    await expect(getOrCreateInstallation(store)).rejects.toThrow("only supported on Android and iOS");
    expect(Crypto.randomUUID).not.toHaveBeenCalled();
  });

  it.each([undefined, "", "   "])("rejects a missing mobile app version", async (version) => {
    const store = fakeCredentialStore("stored-installation-id");
    Constants.expoConfig = { version } as typeof Constants.expoConfig;

    await expect(getOrCreateInstallation(store)).rejects.toThrow("Mobile app version is required");
  });
});
