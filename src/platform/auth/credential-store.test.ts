import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { createCredentialStore, type CredentialStore } from "./credential-store";

jest.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY",
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const renewableCredentialKey = "remanage.mobile.renewable-credential";
const installationIdKey = "remanage.mobile.installation-id";

const secureStore = SecureStore as jest.Mocked<typeof SecureStore>;

function setPlatformOs(os: string): void {
  Object.defineProperty(Platform, "OS", { configurable: true, value: os });
}

describe("createCredentialStore", () => {
  let store: CredentialStore;

  beforeEach(() => {
    jest.clearAllMocks();
    setPlatformOs("ios");
    store = createCredentialStore();
  });

  it("reads and writes only the renewable credential with device-only protection", async () => {
    secureStore.getItemAsync.mockResolvedValueOnce("renewable-credential");

    await expect(store.getRenewableCredential()).resolves.toBe("renewable-credential");
    await store.setRenewableCredential("next-renewable-credential");

    expect(secureStore.getItemAsync).toHaveBeenCalledWith(renewableCredentialKey);
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(renewableCredentialKey, "next-renewable-credential", {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  });

  it("reads and writes the installation ID with device-only protection", async () => {
    secureStore.getItemAsync.mockResolvedValueOnce("installation-id");

    await expect(store.getInstallationId()).resolves.toBe("installation-id");
    await store.setInstallationId("next-installation-id");

    expect(secureStore.getItemAsync).toHaveBeenCalledWith(installationIdKey);
    expect(secureStore.setItemAsync).toHaveBeenCalledWith(installationIdKey, "next-installation-id", {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  });

  it("clears the renewable credential while preserving the installation identity", async () => {
    await store.clearCredentials();

    expect(secureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(renewableCredentialKey);
    expect(secureStore.deleteItemAsync).not.toHaveBeenCalledWith(installationIdKey);
  });

  it("purges both protected device-state keys", async () => {
    await store.purgeDeviceState();

    expect(secureStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(renewableCredentialKey);
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(installationIdKey);
  });

  it("keeps web-preview device state only in memory", async () => {
    setPlatformOs("web");
    store = createCredentialStore();
    secureStore.getItemAsync.mockResolvedValue(null);
    secureStore.setItemAsync.mockResolvedValue(undefined);

    await store.setRenewableCredential("web-renewable");
    await store.setInstallationId("web-installation");

    await expect(store.getRenewableCredential()).resolves.toBe("web-renewable");
    await expect(store.getInstallationId()).resolves.toBe("web-installation");
    await store.clearCredentials();

    await expect(store.getRenewableCredential()).resolves.toBeNull();
    await expect(store.getInstallationId()).resolves.toBe("web-installation");
    expect(secureStore.getItemAsync).not.toHaveBeenCalled();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
    expect(secureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("does not provide any persistence path for access tokens or bootstrap payloads", () => {
    expect(store).not.toHaveProperty("setAccessToken");
    expect(store).not.toHaveProperty("setBootstrap");
    expect(Object.keys(store)).toEqual([
      "getRenewableCredential",
      "setRenewableCredential",
      "clearCredentials",
      "getInstallationId",
      "setInstallationId",
      "purgeDeviceState",
    ]);
  });
});
