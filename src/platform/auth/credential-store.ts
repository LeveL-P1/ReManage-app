import * as SecureStore from "expo-secure-store";

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

export function createCredentialStore(): CredentialStore {
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
