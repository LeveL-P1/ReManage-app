import { FakeCredentialStore, FakeMobileApi } from "@/testing/fakes";

import { demoCredentials } from "./development-demo-auth";
import { createRuntimeSessionController } from "./session-runtime";

describe("createRuntimeSessionController", () => {
  it("uses the local demo path on development web without constructing the real API", async () => {
    const createRealApi = jest.fn(() => new FakeMobileApi());
    const controller = createRuntimeSessionController({ isDevelopment: true, platform: "web" }, new FakeCredentialStore(), createRealApi);

    await controller.signInWithPassword(demoCredentials.email, demoCredentials.password);

    expect(createRealApi).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual(expect.objectContaining({ status: "authenticated", bootstrap: expect.objectContaining({ activeRole: "resident" }) }));
  });

  it("keeps the real API path outside development web", () => {
    const createRealApi = jest.fn(() => new FakeMobileApi());

    createRuntimeSessionController({ isDevelopment: false, platform: "web" }, new FakeCredentialStore(), createRealApi);
    createRuntimeSessionController({ isDevelopment: true, platform: "android" }, new FakeCredentialStore(), createRealApi);

    expect(createRealApi).toHaveBeenCalledTimes(2);
  });
});
