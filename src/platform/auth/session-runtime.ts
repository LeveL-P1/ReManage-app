import { createMobileApi, type MobileApi } from "@/platform/api/mobile-api-client";

import { createCredentialStore, type CredentialStore } from "./credential-store";
import { createDevelopmentDemoMobileApi, developmentDemoInstallation, isDevelopmentWebPreview, type SessionRuntime } from "./development-demo-auth";
import { createSessionController, type SessionController } from "./session-controller";

export function createRuntimeSessionController(
  runtime?: SessionRuntime,
  credentials: CredentialStore = createCredentialStore(),
  createRealApi: () => MobileApi = createMobileApi,
): SessionController {
  if (isDevelopmentWebPreview(runtime)) {
    return createSessionController({
      api: createDevelopmentDemoMobileApi(),
      credentials,
      getInstallation: async () => developmentDemoInstallation,
    });
  }
  return createSessionController({ api: createRealApi(), credentials });
}
