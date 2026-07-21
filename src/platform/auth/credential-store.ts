import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const RENEWABLE_CREDENTIAL_KEY = "remanage.mobile.renewable-credential";
const INSTALLATION_ID_KEY = "remanage.mobile.installation-id";

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export interface CredentialStore {
  getRenewableCredential(): Promise<string | null>;
  setRenewableCredential(value: string): Promise<void>;
  clearCredentials(): Promise<void>;
  getInstallationId(): Promise<string | null>;
  setInstallationId(value: string): Promise<void>;
  purgeDeviceState(): Promise<void>;
}

function createInMemoryCredentialStore(): CredentialStore {
  let renewableCredential: string | null = null;
  let installationId: string | null = null;

  return {
    getRenewableCredential: async () => renewableCredential,
    setRenewableCredential: async (value) => {
      renewableCredential = value;
    },
    clearCredentials: async () => {
      renewableCredential = null;
    },
    getInstallationId: async () => installationId,
    setInstallationId: async (value) => {
      installationId = value;
    },
    purgeDeviceState: async () => {
      renewableCredential = null;
      installationId = null;
    },
  };
}

export function createCredentialStore(): CredentialStore {
  // Expo SecureStore has no web implementation. Keep preview credentials in memory
  // rather than weakening native credential storage with browser persistence.
  if (Platform.OS === "web") return createInMemoryCredentialStore();

  return {
    getRenewableCredential: () => SecureStore.getItemAsync(RENEWABLE_CREDENTIAL_KEY),
    setRenewableCredential: async (value) => {
      await SecureStore.setItemAsync(RENEWABLE_CREDENTIAL_KEY, value, secureStoreOptions);
    },
    clearCredentials: async () => {
      await SecureStore.deleteItemAsync(RENEWABLE_CREDENTIAL_KEY);
    },
    getInstallationId: () => SecureStore.getItemAsync(INSTALLATION_ID_KEY),
    setInstallationId: async (value) => {
      await SecureStore.setItemAsync(INSTALLATION_ID_KEY, value, secureStoreOptions);
    },
    purgeDeviceState: async () => {
      await SecureStore.deleteItemAsync(RENEWABLE_CREDENTIAL_KEY);
      await SecureStore.deleteItemAsync(INSTALLATION_ID_KEY);
    },
  };
}
