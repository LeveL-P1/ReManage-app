import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import test from "node:test";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = path.join(rootDirectory, "contracts", "mobile-v1.openapi.json");

function runSyncCheck(url) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/sync-api-contract.mjs", "--check"], {
      cwd: rootDirectory,
      env: { ...process.env, MOBILE_OPENAPI_URL: url },
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

test("sync check ignores prefix-collision paths outside the mobile v1 namespace", async (t) => {
  const document = JSON.parse(await readFile(contractPath, "utf8"));
  document.paths["/api/mobile/v10/auth/password"] = {};
  document.paths["/api/mobile/v1legacy/auth/password"] = {};

  const server = createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify(document));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());

  const address = server.address();
  assert.ok(address && typeof address === "object");
  const result = await runSyncCheck(`http://127.0.0.1:${address.port}/docs-json`);

  assert.equal(result.code, 0, result.stderr);
});
