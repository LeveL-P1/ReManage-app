declare const __dirname: string;
declare function require(moduleName: string): unknown;

type DirectoryEntry = { name: string; isDirectory(): boolean };

const { readFileSync, readdirSync } = require("fs") as {
  readFileSync(path: string, encoding: string): string;
  readdirSync(path: string, options: { withFileTypes: true }): DirectoryEntry[];
};
const { join } = require("path") as { join(...paths: string[]): string };

const residentLabels = ["Home", "Visitors", "Bills", "More"];
const guardLabels = ["Gate", "Parcels", "Incidents", "More"];

function source(relativePath: string): string {
  return readFileSync(join(__dirname, relativePath), "utf8");
}

function filesIn(relativeDirectory: string): string[] {
  const directory = join(__dirname, relativeDirectory);
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(relativeDirectory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

describe("role-aware navigation contract", () => {
  it("keeps resident and guard tabs separate and server-authorized", () => {
    const residentLayout = source("(resident)/(tabs)/_layout.tsx");
    const guardLayout = source("(guard)/(tabs)/_layout.tsx");
    const rootLayout = source("_layout.tsx");

    for (const label of residentLabels) expect(residentLayout).toContain(label);
    for (const label of ["Gate", "Parcels", "Incidents"]) expect(residentLayout).not.toContain(label);
    for (const label of guardLabels) expect(guardLayout).toContain(label);
    for (const label of ["Home", "Visitors", "Bills"]) expect(guardLayout).not.toContain(label);

    expect(rootLayout.match(/<Stack\.Protected/g)?.length).toBeGreaterThanOrEqual(2);
    expect(rootLayout).toContain('authenticated && role === "resident"');
    expect(rootLayout).toContain('authenticated && role === "guard"');

    const navigationSources = [
      ...filesIn("(resident)"),
      ...filesIn("(guard)"),
      "_layout.tsx",
      "index.tsx",
    ].map(source);
    for (const navigationSource of navigationSources) {
      expect(navigationSource).not.toMatch(/combined dashboard/i);
      expect(navigationSource).not.toMatch(/params\s*:\s*\{[^}]*role/i);
      expect(navigationSource).not.toMatch(/\buse(?:Global|Local)SearchParams\b/);
    }
  });
});
