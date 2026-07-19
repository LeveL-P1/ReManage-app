import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contractPath = path.join(rootDirectory, "contracts", "mobile-v1.openapi.json");
const openApiUrl = process.env.MOBILE_OPENAPI_URL ?? "http://localhost:4000/docs-json";
const checkMode = process.argv.includes("--check");

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, nestedValue]) => [key, sortJson(nestedValue)]),
    );
  }
  return value;
}

const response = await fetch(openApiUrl);
if (!response.ok) {
  throw new Error(`Unable to fetch mobile OpenAPI contract: ${response.status} ${response.statusText}`);
}

const document = await response.json();
if (!document || typeof document !== "object" || Array.isArray(document)) {
  throw new Error("Mobile OpenAPI contract response must be a JSON object");
}

const allPaths = document.paths;
if (!allPaths || typeof allPaths !== "object" || Array.isArray(allPaths)) {
  throw new Error("Mobile OpenAPI contract does not contain paths");
}

const mobilePaths = Object.fromEntries(
  Object.entries(allPaths).filter(
    ([endpoint]) => endpoint === "/api/mobile/v1" || endpoint.startsWith("/api/mobile/v1/"),
  ),
);
if (Object.keys(mobilePaths).length === 0) {
  throw new Error("Mobile OpenAPI contract contains zero /api/mobile/v1 paths");
}

const snapshot = `${JSON.stringify(sortJson({ ...document, paths: mobilePaths }), null, 2)}\n`;

if (checkMode) {
  let currentSnapshot;
  try {
    currentSnapshot = await readFile(contractPath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      throw new Error("Mobile OpenAPI contract is missing; run npm run api:sync");
    }
    throw error;
  }
  if (currentSnapshot !== snapshot) {
    throw new Error("Mobile OpenAPI contract drift detected; run npm run api:sync");
  }
} else {
  await mkdir(path.dirname(contractPath), { recursive: true });
  await writeFile(contractPath, snapshot, "utf8");
}
