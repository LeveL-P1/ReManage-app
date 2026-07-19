import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

import type { CredentialStore } from "./credential-store";

export interface MobileInstallation {
  id: string;
  platform: "android" | "ios";
  appVersion: string;
  deviceName?: string;
}

function nativePlatform(): MobileInstallation["platform"] {
  if (Platform.OS === "android" || Platform.OS === "ios") return Platform.OS;
  throw new Error("Mobile installation is only supported on Android and iOS.");
}

function configuredAppVersion(): string {
  const version = Constants.expoConfig?.version?.trim();
  if (!version) throw new Error("Mobile app version is required.");
  return version;
}

export async function getOrCreateInstallation(store: CredentialStore): Promise<MobileInstallation> {
  const platform = nativePlatform();
  const appVersion = configuredAppVersion();
  let id = await store.getInstallationId();

  if (!id) {
    id = Crypto.randomUUID();
    await store.setInstallationId(id);
  }

  const deviceName = Device.deviceName ?? undefined;
  return deviceName ? { id, platform, appVersion, deviceName } : { id, platform, appVersion };
}
