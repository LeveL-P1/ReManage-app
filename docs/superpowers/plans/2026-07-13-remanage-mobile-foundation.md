# ReManage Mobile Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Deliver the first independently testable vertical slice: an existing approved beta-society account can sign in with password or email OTP, receive a rotating and revocable native device session, restore that session, load a server-authoritative bootstrap, switch between approved Resident and Guard roles, and enter completely separate role navigation shells in the Expo app.

**Architecture:** Keep `ReManage-app` and `ReManageSociety` as separate repositories. Add a dedicated NestJS `MobileApiModule` under `/api/mobile/v1`, backed by new Prisma device-session and OTP records and the existing user/membership data. Export the Nest OpenAPI document as the contract source of truth, generate a checked-in mobile schema, and consume it from an Expo SDK 57 app through `openapi-fetch`. Keep the access credential in memory, the rotating renewable credential in `expo-secure-store`, and make the server session the only authority for society, approved roles, active role, permissions, and navigation.

**Tech Stack:** Node.js 20+, NestJS 11, Fastify 5, Prisma 7/PostgreSQL, `jose`, `bcryptjs`, `class-validator`, Vitest; React Native with Expo SDK 57, Expo Router, TypeScript, `expo-secure-store`, `expo-crypto`, TanStack Query, `openapi-typescript`, `openapi-fetch`, Jest Expo, and React Native Testing Library.

**Global Constraints:**

- Backend repository: `C:\Users\pawan\Projects\ReManageSociety`.
- Mobile repository: `C:\Users\pawan\Projects\ReManage-app`.
- The approved design source is `ReManage-app/docs/superpowers/specs/2026-07-13-remanage-mobile-app-design.md`.
- Do not move backend code into the mobile repository and do not add Expo code to `ReManageSociety`.
- The mobile app may call only `/api/mobile/v1`; it must never call a legacy Next.js API route or `/api/v1` directly.
- Do not change the current browser cookie/JWT login flow. Native sessions use separate tables, secrets, guards, and endpoints.
- This phase targets the configured one-society beta only. `MOBILE_BETA_SOCIETY_ID` is the sole society accepted by mobile login.
- For this phase, login OTP is delivered to the required unique `User.email` through the existing SMTP configuration. Phone/SMS OTP is not part of this plan.
- Password and OTP login accept existing, active users with an active membership and a mobile role assignment. There is no signup route or UI.
- Canonical mobile roles are only `resident` and `guard`. `member`, `tenant`, and `resident` backfill to `resident`; `guard` and `watchman` backfill to `guard`.
- When both roles are approved, the initial role is `resident`; otherwise use the only approved role.
- Access tokens expire after 10 minutes. Renewable credentials roll for 30 days, rotate after every successful refresh, and are stored only as an HMAC hash on the server.
- The access token stays in process memory on the device. Only the renewable credential and installation ID go into SecureStore.
- `EXPO_PUBLIC_API_BASE_URL` is public configuration, never a secret. No server key, OTP pepper, access-token key, or SMTP credential enters the mobile bundle.
- Push registration, Guard offline queues, Resident/Guard business workflows, EAS distribution, TestFlight, and public-store setup belong to later plans.
- Preserve unrelated user changes. In `ReManage-app`, never stage or commit `.superpowers/`.
- Every implementation task follows red-green-refactor: write the specified failing test, run it and observe the expected failure, implement the smallest change, rerun the focused test, then run the stated regression checks.
- Make commits in the repository named by each task. Never create a cross-repository commit.

---

## Scope and acceptance gate

This plan is complete only when all of the following are demonstrated against a test database:

1. Password login succeeds only for an active, approved account in the configured beta society.
2. OTP request returns the same public response for known and unknown email addresses; a valid emailed OTP is short-lived, single-use, attempt-limited, and never logged.
3. Refresh rotates the renewable credential; presenting the replaced credential revokes the device session.
4. Bootstrap returns the verified user, society, approved roles, active role, permissions, feature flags, and notification policy.
5. Switching roles increments the device-session version, invalidates the previous access token, audits the switch, and returns a new access token/bootstrap.
6. The app restores from SecureStore, performs at most one refresh at a time, and purges credentials when refresh is rejected.
7. A Resident sees only `Home`, `Visitors`, `Bills`, and `More`; a Guard sees only `Gate`, `Parcels`, `Incidents`, and `More`.
8. There is no combined dashboard, no signup UI, and no mobile call outside `/api/mobile/v1`.
9. Backend focused tests, backend typechecks, mobile Jest tests, mobile TypeScript checks, and an Expo production bundle all pass.

## Explicitly deferred

- Resident and Guard feature data beyond navigation-shell foundation surfaces
- Visitor, parcel, incident, shift, SOS, notice, billing, UTR, and community endpoints
- Native push token registration and notification delivery
- Offline storage, action queues, conflict handling, and synchronization
- Web administration UI for adding a second mobile role assignment
- Remote device-session management UI
- EAS project linking, development/preview builds, Android internal distribution, and TestFlight
- Production observability and beta graduation dashboards

## Current-state facts the implementation must preserve

- `ReManageSociety/apps/api/src/main.ts` already creates a Fastify Nest app and exposes Swagger at `/docs` and JSON at `/docs-json`.
- Existing Nest controllers use `/api/v1`, `AuthenticationGuard`, bearer tokens, and `x-society-id`. Mobile controllers use neither that route prefix nor that guard.
- Existing web login in `src/app/api/auth/login/route.ts` creates a seven-day browser session. It remains unchanged.
- Existing `UserSession` stores web sessions and remains unchanged. Native credentials never use that model.
- `SocietyMembership` currently permits one membership row per user and society. A normalized `SocietyRoleAssignment` child model is therefore required for secure multi-role support.
- `packages/sdk/scripts/generate-openapi-client.mjs` currently saves Swagger JSON but does not generate TypeScript. This plan completes that boundary for mobile paths.
- `ReManage-app` currently contains only documentation and a minimal README, so Expo must be scaffolded without deleting `docs/` or committing `.superpowers/`.

## Planned file map

### ReManageSociety

```text
prisma/
  schema.prisma                                      # modify
  migrations/20260713090000_mobile_foundation/
    migration.sql                                   # create
packages/config/src/
  env.ts                                             # modify
  production.ts                                      # modify
  production.test.ts                                 # modify
packages/security/src/
  permission-policy.ts                               # modify
  permission-policy.test.ts                          # modify
  index.ts                                           # modify
packages/sdk/
  package.json                                       # modify
  scripts/generate-openapi-client.mjs                # modify
  generated/mobile-v1.openapi.json                   # create, generated
  generated/mobile-v1.ts                             # create, generated
apps/api/src/
  app.module.ts                                      # modify
  main.ts                                            # modify
  openapi.ts                                         # create
  mobile/
    mobile-api.module.ts                             # create
    common/
      mobile-config.service.ts                       # create
      mobile-problem.filter.ts                       # create
      mobile-request.ts                              # create
      mobile-role.ts                                 # create
    auth/
      dto/mobile-auth.dto.ts                         # create
      mobile-auth.controller.ts                      # create
      mobile-auth.service.ts                         # create
      mobile-auth.service.test.ts                    # create
      mobile-identity.repository.ts                  # create
      mobile-identity.repository.test.ts             # create
      mobile-otp-delivery.ts                         # create
      mobile-otp.service.ts                          # create
      mobile-otp.service.test.ts                     # create
      smtp-mobile-otp-delivery.service.ts            # create
    session/
      dto/mobile-session.dto.ts                      # create
      mobile-access-token.service.ts                 # create
      mobile-access-token.service.test.ts            # create
      mobile-device-session.repository.ts            # create
      mobile-device-session.repository.test.ts       # create
      mobile-session.controller.ts                   # create
      mobile-session.guard.ts                        # create
      mobile-session.guard.test.ts                   # create
      mobile-session.service.ts                      # create
      mobile-session.service.test.ts                 # create
tests/contract/
  mobile-foundation-schema.test.ts                   # create
  mobile-openapi-contract.test.ts                    # create
```

### ReManage-app

```text
.env.example                                         # create
app.json                                             # create from Expo template, then modify
package.json                                         # create from Expo template, then modify
package-lock.json                                    # create
tsconfig.json                                        # create from Expo template, then modify
jest.config.js                                       # create
jest.setup.ts                                        # create
contracts/mobile-v1.openapi.json                     # create, generated
scripts/sync-api-contract.mjs                        # create
src/app/
  _layout.tsx                                        # create
  index.tsx                                          # create
  (auth)/_layout.tsx                                 # create
  (auth)/sign-in.tsx                                 # create
  (auth)/otp.tsx                                     # create
  (resident)/_layout.tsx                             # create
  (resident)/(tabs)/_layout.tsx                      # create
  (resident)/(tabs)/index.tsx                        # create
  (resident)/(tabs)/visitors.tsx                     # create
  (resident)/(tabs)/bills.tsx                        # create
  (resident)/(tabs)/more.tsx                         # create
  (guard)/_layout.tsx                                # create
  (guard)/(tabs)/_layout.tsx                         # create
  (guard)/(tabs)/index.tsx                           # create
  (guard)/(tabs)/parcels.tsx                         # create
  (guard)/(tabs)/incidents.tsx                       # create
  (guard)/(tabs)/more.tsx                            # create
src/platform/
  api/generated/mobile-v1.ts                         # create, generated
  api/mobile-api-client.ts                           # create
  api/mobile-api-client.test.ts                      # create
  auth/credential-store.ts                           # create
  auth/credential-store.test.ts                      # create
  auth/installation.ts                               # create
  auth/session-controller.ts                         # create
  auth/session-controller.test.ts                    # create
  auth/session-provider.tsx                          # create
  auth/session-reducer.ts                            # create
  auth/session-reducer.test.ts                       # create
  config/env.ts                                      # create
  query/query-client.ts                              # create
  query/react-native-query-lifecycle.tsx             # create
  theme/tokens.ts                                    # create
src/features/
  auth/password-sign-in-screen.tsx                   # create
  auth/password-sign-in-screen.test.tsx              # create
  auth/otp-verify-screen.tsx                         # create
  auth/otp-verify-screen.test.tsx                    # create
  session/role-switcher.tsx                          # create
  session/role-switcher.test.tsx                     # create
  resident/resident-shell-screen.tsx                 # create
  guard/guard-shell-screen.tsx                       # create
src/testing/
  fakes.ts                                           # create
README.md                                            # replace minimal content
```

## Official implementation references

- [Expo create-expo-app and SDK 57 template](https://docs.expo.dev/more/create-expo/)
- [Expo Router authentication and protected routes](https://docs.expo.dev/router/advanced/authentication/)
- [Expo SecureStore](https://docs.expo.dev/versions/v55.0.0/sdk/securestore/)
- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [NestJS OpenAPI DTO guidance](https://docs.nestjs.com/openapi/types-and-parameters)
- [openapi-fetch](https://openapi-ts.dev/openapi-fetch/)
- [TanStack Query installation and React Native lifecycle](https://tanstack.com/query/latest/docs/framework/react/installation)

---

## Execution setup

Before Task 1, invoke `superpowers:using-git-worktrees` and create isolated worktrees from the current `main` of each repository:

```text
C:\tmp\remanage-mobile-foundation-app      branch codex/mobile-foundation
C:\tmp\remanage-mobile-foundation-api      branch codex/mobile-api-foundation
```

Verify both source repositories are clean enough to branch. `ReManageSociety` is currently expected to be clean. `ReManage-app/.superpowers/` is user-owned untracked design tooling and must remain only in the source checkout; do not copy, clean, stage, or commit it. All commands below run in the corresponding worktree even though repository roots are named for clarity.

Run the test command specified by each red step before implementation. If it unexpectedly passes, stop and inspect whether the behaviour already exists or the test is not exercising the intended boundary.

---

## Task 1: Create native-session, OTP, and multi-role persistence

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Create: `tests/contract/mobile-foundation-schema.test.ts`
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260713090000_mobile_foundation/migration.sql`

- [ ] **Step 1: Write the failing schema contract test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync("prisma/schema.prisma", "utf8");
const migration = readFileSync(
  "prisma/migrations/20260713090000_mobile_foundation/migration.sql",
  "utf8",
);

describe("mobile foundation schema", () => {
  it("separates native sessions from legacy browser sessions", () => {
    expect(schema).toContain("model MobileDeviceSession");
    expect(schema).toContain("refreshTokenHash");
    expect(schema).toContain("model MobileOtpChallenge");
    expect(schema).toContain("model SocietyRoleAssignment");
    expect(schema).toContain("@@index([userId, societyId, installationId, revokedAt])");
    expect(migration).toContain("MobileDeviceSession_one_active_installation_idx");
    expect(schema).not.toContain("renewableCredential String");
  });

  it("backfills only the two approved mobile personas", () => {
    expect(migration).toContain("'resident'");
    expect(migration).toContain("'guard'");
    expect(migration).toContain("ON CONFLICT DO NOTHING");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm red**

Run: `npx vitest run tests/contract/mobile-foundation-schema.test.ts`

Expected: FAIL because the migration file and the three models do not exist.

- [ ] **Step 3: Add relations to the existing models**

Add these relation fields without removing current fields:

```prisma
// In model User
mobileDeviceSessions MobileDeviceSession[]
mobileOtpChallenges  MobileOtpChallenge[]

// In model Society
mobileDeviceSessions MobileDeviceSession[]
mobileOtpChallenges  MobileOtpChallenge[]

// In model SocietyMembership
roleAssignments      SocietyRoleAssignment[]
mobileDeviceSessions MobileDeviceSession[]
```

- [ ] **Step 4: Add the new Prisma models**

```prisma
model SocietyRoleAssignment {
  id             String   @id @default(cuid())
  membershipId   String
  role           String
  permissionRole String
  revokedAt      DateTime?
  createdAt      DateTime @default(now())

  membership SocietyMembership @relation(fields: [membershipId], references: [id], onDelete: Cascade)

  @@unique([membershipId, role])
  @@index([membershipId, permissionRole, revokedAt])
}

model MobileDeviceSession {
  id                   String   @id @default(cuid())
  userId               String
  membershipId         String
  societyId            String
  installationId       String
  platform             String
  appVersion           String
  deviceName           String?
  activeRole           String
  activePermissionRole String
  refreshFamilyId      String
  refreshTokenHash     String
  refreshRotation      Int      @default(0)
  version              Int      @default(1)
  expiresAt            DateTime
  revokedAt            DateTime?
  revokeReason         String?
  lastSeenAt           DateTime @default(now())
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  membership SocietyMembership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  society    Society           @relation(fields: [societyId], references: [id], onDelete: Cascade)

  @@index([userId, societyId, installationId, revokedAt])
  @@index([societyId, revokedAt, expiresAt])
}

model MobileOtpChallenge {
  id             String    @id
  userId         String
  societyId      String
  installationId String
  identifierHash String
  codeHash       String
  attempts       Int       @default(0)
  expiresAt      DateTime
  consumedAt     DateTime?
  createdAt      DateTime  @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  society Society @relation(fields: [societyId], references: [id], onDelete: Cascade)

  @@index([identifierHash, createdAt])
  @@index([installationId, createdAt])
  @@index([expiresAt, consumedAt])
}
```

- [ ] **Step 5: Create the SQL migration with foreign keys, indexes, and role backfill**

The migration must create the same columns and constraints as the Prisma models. Its backfill statement must be exactly equivalent to:

```sql
INSERT INTO "SocietyRoleAssignment" (
  "id",
  "membershipId",
  "role",
  "permissionRole",
  "createdAt"
)
SELECT
  CONCAT('mra_', MD5("id" || ':' || "productRole")),
  "id",
  CASE
    WHEN "productRole" IN ('member', 'tenant', 'resident') THEN 'resident'
    WHEN "productRole" IN ('guard', 'watchman') THEN 'guard'
  END,
  "permissionRole",
  CURRENT_TIMESTAMP
FROM "SocietyMembership"
WHERE "status" = 'active'
  AND "productRole" IN ('member', 'tenant', 'resident', 'guard', 'watchman')
ON CONFLICT DO NOTHING;
```

Add a database-enforced partial unique index so only one non-revoked session is active per user, society, and installation while revoked history remains available:

```sql
CREATE UNIQUE INDEX "MobileDeviceSession_one_active_installation_idx"
ON "MobileDeviceSession" ("userId", "societyId", "installationId")
WHERE "revokedAt" IS NULL;
```

Do not copy data from `UserSession`, and do not add a plaintext credential column.

- [ ] **Step 6: Validate and generate Prisma client**

Run: `npm run db:validate`

Expected: PASS with `The schema at prisma/schema.prisma is valid`.

Run: `npm run db:generate`

Expected: PASS and Prisma Client generation completes.

- [ ] **Step 7: Run the focused test and schema regressions**

Run: `npx vitest run tests/contract/mobile-foundation-schema.test.ts src/lib/auth-schema-contract.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the persistence slice**

```powershell
git add prisma/schema.prisma prisma/migrations/20260713090000_mobile_foundation/migration.sql tests/contract/mobile-foundation-schema.test.ts
git commit -m "feat(api): add mobile session persistence"
```

---

## Task 2: Add mobile configuration and permission enumeration

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Modify: `packages/config/src/env.ts`
- Modify: `packages/config/src/production.ts`
- Modify: `packages/config/src/production.test.ts`
- Modify: `packages/security/src/permission-policy.ts`
- Modify: `packages/security/src/permission-policy.test.ts`
- Modify: `packages/security/src/index.ts`
- Create: `apps/api/src/mobile/common/mobile-config.service.ts`
- Create: `apps/api/src/mobile/common/mobile-role.ts`
- Create: `apps/api/src/mobile/common/mobile-role.test.ts`

- [ ] **Step 1: Write failing tests for configuration and canonical roles**

Add production-config cases asserting that when `MOBILE_API_ENABLED=true`, these values are mandatory and non-empty:

```text
MOBILE_BETA_SOCIETY_ID
MOBILE_ACCESS_TOKEN_SECRET
MOBILE_REFRESH_TOKEN_PEPPER
MOBILE_OTP_PEPPER
SMTP_URL
EMAIL_FROM
```

Create `mobile-role.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { defaultMobileRole, normalizeMobileRole } from "./mobile-role.ts";

describe("mobile roles", () => {
  it.each([
    ["member", "resident"],
    ["tenant", "resident"],
    ["resident", "resident"],
    ["guard", "guard"],
    ["watchman", "guard"],
  ])("normalizes %s to %s", (source, expected) => {
    expect(normalizeMobileRole(source)).toBe(expected);
  });

  it("does not expose non-MVP personas", () => {
    expect(normalizeMobileRole("chairman")).toBeNull();
    expect(normalizeMobileRole("treasurer")).toBeNull();
  });

  it("prefers resident when both roles are approved", () => {
    expect(defaultMobileRole(["guard", "resident"])).toBe("resident");
  });
});
```

- [ ] **Step 2: Run tests and confirm red**

Run: `npx vitest run packages/config/src/production.test.ts apps/api/src/mobile/common/mobile-role.test.ts packages/security/src/permission-policy.test.ts`

Expected: FAIL because mobile environment keys, role helpers, and permission enumeration do not exist.

- [ ] **Step 3: Extend the environment contract**

Add these fields to `AppEnv` and matching `ENV_RULES` entries:

```ts
MOBILE_API_ENABLED: boolean;
MOBILE_BETA_SOCIETY_ID: string;
MOBILE_ACCESS_TOKEN_SECRET: string;
MOBILE_REFRESH_TOKEN_PEPPER: string;
MOBILE_OTP_PEPPER: string;
```

Use `false` as the default for `MOBILE_API_ENABLED` and empty optional strings for the remaining mobile fields. Extend `assertProductionReady` so the six listed operational values are required only when the mobile API is enabled. Require both secrets and the OTP pepper to contain at least 32 characters.

- [ ] **Step 4: Add a fail-closed Nest configuration service**

Expose this exact public shape:

```ts
export interface MobileRuntimeConfig {
  enabled: boolean;
  betaSocietyId: string;
  accessTokenSecret: string;
  refreshTokenPepper: string;
  otpPepper: string;
  accessTokenTtlSeconds: 600;
  renewableTtlDays: 30;
  otpTtlSeconds: 300;
  otpMaxAttempts: 5;
}

@Injectable()
export class MobileConfigService {
  readonly value: MobileRuntimeConfig;

  constructor(source: NodeJS.ProcessEnv = process.env) {
    this.value = readMobileRuntimeConfig(source);
  }
}
```

`readMobileRuntimeConfig` must reject requests when disabled and must never substitute development fallback secrets when enabled.

- [ ] **Step 5: Implement canonical role helpers**

```ts
export const MOBILE_ROLES = ["resident", "guard"] as const;
export type MobileRole = (typeof MOBILE_ROLES)[number];
export type MobilePermissionRole = "resident" | "member" | "tenant" | "guard";

export function normalizeMobileRole(value: string): MobileRole | null {
  if (["member", "tenant", "resident"].includes(value)) return "resident";
  if (["guard", "watchman"].includes(value)) return "guard";
  return null;
}

export function defaultMobileRole(roles: readonly MobileRole[]): MobileRole {
  if (roles.includes("resident")) return "resident";
  if (roles.includes("guard")) return "guard";
  throw new Error("At least one approved mobile role is required");
}

export function isPermissionRoleValidForMobileRole(
  role: MobileRole,
  permissionRole: string,
): permissionRole is MobilePermissionRole {
  if (role === "guard") return permissionRole === "guard";
  return ["resident", "member", "tenant"].includes(permissionRole);
}
```

Add tests proving a `guard` assignment with `member` permission and a `resident` assignment with `guard` permission are rejected.

- [ ] **Step 6: Export permission enumeration without changing decisions**

Add to `permission-policy.ts`:

```ts
export function permissionsForRoles(
  roles: readonly (SocietyRole | "platform_admin")[],
): readonly PermissionAction[] {
  return [...new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role]))];
}
```

Export it from `packages/security/src/index.ts`. Add tests proving `resident` cannot receive `operations:gate.manage`, `guard` cannot receive `operations:visitor.respond`, and the returned list contains no duplicate permissions.

- [ ] **Step 7: Run focused tests and typechecks**

Run: `npx vitest run packages/config/src/production.test.ts apps/api/src/mobile/common/mobile-role.test.ts packages/security/src/permission-policy.test.ts`

Expected: PASS.

Run: `npm run typecheck:config`

Expected: PASS.

Run: `npm run typecheck:security`

Expected: PASS.

- [ ] **Step 8: Commit configuration and role policy**

```powershell
git add packages/config/src/env.ts packages/config/src/production.ts packages/config/src/production.test.ts packages/security/src/permission-policy.ts packages/security/src/permission-policy.test.ts packages/security/src/index.ts apps/api/src/mobile/common/mobile-config.service.ts apps/api/src/mobile/common/mobile-role.ts apps/api/src/mobile/common/mobile-role.test.ts
git commit -m "feat(api): define mobile runtime policy"
```

---

## Task 3: Implement access-token and renewable-credential primitives

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Create: `apps/api/src/mobile/session/mobile-access-token.service.ts`
- Create: `apps/api/src/mobile/session/mobile-access-token.service.test.ts`
- Create: `apps/api/src/mobile/session/mobile-device-session.repository.ts`
- Create: `apps/api/src/mobile/session/mobile-device-session.repository.test.ts`

- [ ] **Step 1: Write failing token tests**

Cover these exact claims and behaviours:

```ts
export interface MobileAccessClaims {
  sub: string;
  sid: string;
  societyId: string;
  membershipId: string;
  activeRole: "resident" | "guard";
  activePermissionRole: string;
  version: number;
  type: "mobile_access";
}
```

Tests must assert issuer `remanage-mobile-api`, audience `remanage-mobile-app`, a 10-minute expiry, rejection under a different secret, and rejection when `type` is not `mobile_access`.

- [ ] **Step 2: Write failing repository tests**

Use a fake Prisma-shaped client. Assert:

- new sessions store only `refreshTokenHash`, never the raw renewable credential;
- creating a session for the same user, society, and installation revokes the prior row and creates a new session ID/family while preserving history;
- a valid rotation changes the hash, increments `refreshRotation`, and updates `lastSeenAt`;
- presenting a credential replaced by rotation marks that same session revoked with reason `refresh_reuse_detected`;
- presenting a credential from a session already replaced by a newer login does not revoke the newer session;
- expired and already-revoked sessions cannot rotate;
- logout is idempotent.

- [ ] **Step 3: Run focused tests and confirm red**

Run: `npx vitest run apps/api/src/mobile/session/mobile-access-token.service.test.ts apps/api/src/mobile/session/mobile-device-session.repository.test.ts`

Expected: FAIL because the services do not exist.

- [ ] **Step 4: Implement access-token signing and verification**

Use `jose` with HS256 and the dedicated mobile secret. The service public API is:

```ts
@Injectable()
export class MobileAccessTokenService {
  constructor(private readonly config: MobileConfigService) {}

  issue(claims: MobileAccessClaims): Promise<string>;
  verify(token: string): Promise<MobileAccessClaims>;
}
```

Do not call `getBffBridgeSecret`, `SESSION_SECRET`, or the Keycloak verifier.

- [ ] **Step 5: Implement renewable credential format and hashing**

Use 32 random bytes and return a credential in this form:

```text
mobile-session-id.base64url-random-secret
```

Hash `sessionId:secret` with HMAC-SHA256 and `MOBILE_REFRESH_TOKEN_PEPPER`. Export no method that returns a stored raw credential. Use `timingSafeEqual` for comparisons.

- [ ] **Step 6: Implement atomic repository operations**

Expose this public interface:

```ts
export interface CreateMobileSessionInput {
  userId: string;
  membershipId: string;
  societyId: string;
  installationId: string;
  platform: "android" | "ios";
  appVersion: string;
  deviceName?: string;
  activeRole: MobileRole;
  activePermissionRole: string;
}

export interface IssuedRenewableCredential {
  sessionId: string;
  credential: string;
  expiresAt: Date;
  version: number;
}
```

Use a Prisma transaction for create/replace, rotate, role-version update, and revoke. A refresh-hash mismatch for a known session ID is reuse, not a generic missing-session case.

- [ ] **Step 7: Run tests and API typecheck**

Run: `npx vitest run apps/api/src/mobile/session/mobile-access-token.service.test.ts apps/api/src/mobile/session/mobile-device-session.repository.test.ts`

Expected: PASS.

Run: `npm run typecheck:api`

Expected: PASS.

- [ ] **Step 8: Commit credential primitives**

```powershell
git add apps/api/src/mobile/session/mobile-access-token.service.ts apps/api/src/mobile/session/mobile-access-token.service.test.ts apps/api/src/mobile/session/mobile-device-session.repository.ts apps/api/src/mobile/session/mobile-device-session.repository.test.ts
git commit -m "feat(api): add rotating mobile credentials"
```

---

## Task 4: Add approved-account lookup and password login

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Create: `apps/api/src/mobile/auth/dto/mobile-auth.dto.ts`
- Create: `apps/api/src/mobile/session/dto/mobile-session.dto.ts`
- Create: `apps/api/src/mobile/auth/mobile-identity.repository.ts`
- Create: `apps/api/src/mobile/auth/mobile-identity.repository.test.ts`
- Create: `apps/api/src/mobile/auth/mobile-auth.service.ts`
- Create: `apps/api/src/mobile/auth/mobile-auth.service.test.ts`
- Create: `apps/api/src/mobile/auth/mobile-auth.controller.ts`
- Create: `apps/api/src/mobile/session/mobile-session.service.ts`
- Create: `apps/api/src/mobile/session/mobile-session.service.test.ts`
- Create: `apps/api/src/mobile/mobile-api.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing identity-repository tests**

Use a fake Prisma client and prove that lookup:

- normalizes the email with `trim().toLowerCase()`;
- requires `User.isActive=true`;
- requires an active membership in `MOBILE_BETA_SOCIETY_ID`;
- reads non-revoked, role/permission-compatible assignments from `SocietyRoleAssignment`, not `User.role`;
- returns `null` when no Resident or Guard assignment exists;
- returns both role assignments for a dual-role account.

The repository result must use this shape:

```ts
export interface MobileIdentity {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  societyId: string;
  societyName: string;
  membershipId: string;
  flatId: string | null;
  roles: readonly {
    role: MobileRole;
    permissionRole: MobilePermissionRole;
  }[];
}
```

- [ ] **Step 2: Write failing password-login tests**

Inject fake identity, session, audit, and rate-limit dependencies. Assert:

- a correct password creates a device session and returns both credentials;
- a missing account, inactive account, wrong password, and unapproved membership all return the same `invalid_credentials` error;
- password login is limited by installation ID and network address;
- logs and audit metadata never include the password or either credential.

- [ ] **Step 3: Run focused tests and confirm red**

Run: `npx vitest run apps/api/src/mobile/auth/mobile-identity.repository.test.ts apps/api/src/mobile/auth/mobile-auth.service.test.ts apps/api/src/mobile/session/mobile-session.service.test.ts`

Expected: FAIL because the identity, authentication, and session services do not exist.

- [ ] **Step 4: Create Swagger-visible request and response DTOs**

Use classes, `class-validator`, and `@ApiProperty`; do not use controller-local interfaces. The minimum request contract is:

```ts
export class MobileInstallationDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ enum: ["android", "ios"] })
  @IsIn(["android", "ios"])
  platform!: "android" | "ios";

  @ApiProperty({ example: "1.0.0" })
  @IsString()
  @Length(1, 32)
  appVersion!: string;

  @ApiPropertyOptional({ example: "Pixel 9" })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  deviceName?: string;
}

export class PasswordLoginRequestDto {
  @ApiProperty({ format: "email" })
  @IsEmail()
  identifier!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 256)
  password!: string;

  @ApiProperty({ type: MobileInstallationDto })
  @ValidateNested()
  @Type(() => MobileInstallationDto)
  installation!: MobileInstallationDto;
}
```

The session response DTO contains exactly these top-level fields:

```ts
export class MobileSessionIssueDto {
  accessToken!: string;
  accessExpiresAt!: string;
  renewableCredential!: string;
  renewableExpiresAt!: string;
  deviceSessionId!: string;
  activeRole!: MobileRole;
}
```

- [ ] **Step 5: Implement approved identity lookup**

Query `User` by normalized email and include one active membership for the configured beta society, its society name, and all role assignments. Return `null` unless every eligibility condition is satisfied. Never fall back to `User.role` or an inactive membership.

- [ ] **Step 6: Implement session issuance**

`MobileSessionService.issueForIdentity(identity, installation)` must:

1. select the default role;
2. create or replace the device session;
3. issue a 10-minute access token containing the new session version;
4. return the raw renewable credential only in the response object;
5. send no cookie and write no `UserSession` row.

- [ ] **Step 7: Implement password authentication and controller**

Use `bcryptjs.compare`. The controller route is exactly:

```ts
@ApiTags("mobile-auth")
@Controller("api/mobile/v1/auth")
export class MobileAuthController {
  @Post("password")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MobileSessionIssueDto })
  password(
    @Req() request: FastifyRequest,
    @Body() body: PasswordLoginRequestDto,
  ): Promise<MobileSessionIssueDto>;
}
```

The service must check `MobileConfigService.value.enabled` before account lookup and must use generic public error text.

Enforce 10 password attempts per identifier hash, 20 per installation ID, and 30 per network address per 15 minutes. Hash the identifier before building limiter keys.

- [ ] **Step 8: Register the module without changing legacy modules**

`MobileApiModule` owns all mobile controllers and providers and imports `SecurityModule`. Add only `MobileApiModule` to `AppModule.imports`; do not modify existing controller paths or guards.

- [ ] **Step 9: Run focused tests and regression typecheck**

Run: `npx vitest run apps/api/src/mobile/auth/mobile-identity.repository.test.ts apps/api/src/mobile/auth/mobile-auth.service.test.ts apps/api/src/mobile/session/mobile-session.service.test.ts`

Expected: PASS.

Run: `npm run typecheck:api`

Expected: PASS.

- [ ] **Step 10: Commit password login**

```powershell
git add apps/api/src/mobile apps/api/src/app.module.ts
git commit -m "feat(api): add mobile password login"
```

---

## Task 5: Add enumeration-safe email OTP login

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `apps/api/src/mobile/auth/dto/mobile-auth.dto.ts`
- Modify: `apps/api/src/mobile/auth/mobile-auth.controller.ts`
- Modify: `apps/api/src/mobile/mobile-api.module.ts`
- Create: `apps/api/src/mobile/auth/mobile-otp-delivery.ts`
- Create: `apps/api/src/mobile/auth/smtp-mobile-otp-delivery.service.ts`
- Create: `apps/api/src/mobile/auth/mobile-otp.service.ts`
- Create: `apps/api/src/mobile/auth/mobile-otp.service.test.ts`

- [ ] **Step 1: Install the SMTP dependency**

Run: `npm install nodemailer`

Run: `npm install --save-dev @types/nodemailer`

Expected: `package.json` and `package-lock.json` change; install completes without peer-resolution errors.

- [ ] **Step 2: Write failing OTP tests with a fake delivery adapter**

Test all of the following with an injected clock and random-code function:

- known and unknown emails both return `{ accepted: true, challengeId }`;
- both public responses have the same keys and status;
- unknown email creates no database record and sends no message;
- known email stores only `identifierHash` and `codeHash`;
- generated code is six digits, expires in five minutes, and is sent only through the delivery adapter;
- wrong codes increment attempts; the sixth verification is rejected without comparing a code;
- an expired or consumed challenge is rejected;
- successful verification consumes the challenge and issues a device session exactly once;
- request limits apply independently to identifier hash, installation ID, and network address;
- no logger call contains the email, code, code hash, password, access token, or renewable credential.
- SMTP delivery failure records a redacted operational failure but still returns the same accepted response as an unknown account.

- [ ] **Step 3: Run the focused test and confirm red**

Run: `npx vitest run apps/api/src/mobile/auth/mobile-otp.service.test.ts`

Expected: FAIL because OTP services and DTOs do not exist.

- [ ] **Step 4: Add OTP DTOs**

```ts
export class OtpRequestDto {
  @ApiProperty({ format: "email" })
  @IsEmail()
  identifier!: string;

  @ApiProperty({ type: MobileInstallationDto })
  @ValidateNested()
  @Type(() => MobileInstallationDto)
  installation!: MobileInstallationDto;
}

export class OtpRequestAcceptedDto {
  accepted!: true;
  challengeId!: string;
}

export class OtpVerifyDto {
  @IsUUID()
  challengeId!: string;

  @Matches(/^\d{6}$/)
  code!: string;

  @ValidateNested()
  @Type(() => MobileInstallationDto)
  installation!: MobileInstallationDto;
}
```

- [ ] **Step 5: Implement the delivery port and SMTP adapter**

```ts
export const MOBILE_OTP_DELIVERY = Symbol("MOBILE_OTP_DELIVERY");

export interface MobileOtpDelivery {
  sendLoginCode(input: {
    recipientEmail: string;
    recipientName: string;
    code: string;
    expiresInMinutes: 5;
  }): Promise<void>;
}
```

The SMTP adapter uses `SMTP_URL` and `EMAIL_FROM`, a subject of `Your ReManage login code`, and a plain-text body that states the code expires in five minutes. It must not log the message payload.

- [ ] **Step 6: Implement challenge creation and verification**

Use Node `randomInt(0, 1_000_000)` padded to six digits. Hash the normalized identifier and `challengeId:code` with HMAC-SHA256 using `MOBILE_OTP_PEPPER`. For unknown accounts, create a random public challenge ID but no row. Compare hashes with `timingSafeEqual`.

Use dedicated `RateLimitService` instances configured to enforce:

- 5 OTP requests per identifier hash per 15 minutes;
- 10 OTP requests per installation per 15 minutes;
- 20 OTP requests per network address per 15 minutes;
- 30 verification requests per installation per 15 minutes;
- 5 stored attempts per challenge.

- [ ] **Step 7: Add controller routes**

```text
POST /api/mobile/v1/auth/otp/request   -> 202 OtpRequestAcceptedDto
POST /api/mobile/v1/auth/otp/verify    -> 200 MobileSessionIssueDto
```

Do not expose an OTP signup route and do not return a `user_exists` field.

- [ ] **Step 8: Run focused and authentication regression tests**

Run: `npx vitest run apps/api/src/mobile/auth/mobile-otp.service.test.ts apps/api/src/mobile/auth/mobile-auth.service.test.ts`

Expected: PASS.

Run: `npm run typecheck:api`

Expected: PASS.

- [ ] **Step 9: Commit OTP login**

```powershell
git add package.json package-lock.json apps/api/src/mobile/auth apps/api/src/mobile/mobile-api.module.ts
git commit -m "feat(api): add mobile email otp login"
```

---

## Task 6: Add refresh rotation and logout

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Modify: `apps/api/src/mobile/session/dto/mobile-session.dto.ts`
- Modify: `apps/api/src/mobile/session/mobile-session.service.ts`
- Modify: `apps/api/src/mobile/session/mobile-session.service.test.ts`
- Create: `apps/api/src/mobile/session/mobile-session.controller.ts`
- Modify: `apps/api/src/mobile/mobile-api.module.ts`

- [ ] **Step 1: Write failing refresh and logout service tests**

Assert:

- a valid renewable credential rotates its secret/hash and issues a new access token;
- the new credential extends `expiresAt` to 30 days from the refresh time;
- the old credential fails and revokes the session as reuse;
- a removed role assignment cannot survive refresh;
- if the active role was removed but another role remains, refresh selects the remaining role and increments session version;
- when no approved role remains, refresh revokes and returns unauthorized;
- logout revokes by renewable credential and succeeds when repeated;
- no refresh attempt loops inside the service.

- [ ] **Step 2: Run the focused test and confirm red**

Run: `npx vitest run apps/api/src/mobile/session/mobile-session.service.test.ts`

Expected: FAIL on missing refresh/logout methods.

- [ ] **Step 3: Add DTOs**

```ts
export class RefreshMobileSessionDto {
  @IsString()
  @Length(40, 512)
  renewableCredential!: string;
}

export class LogoutMobileSessionDto {
  @IsString()
  @Length(40, 512)
  renewableCredential!: string;
}
```

- [ ] **Step 4: Implement refresh with live authorization**

Refresh must parse the non-secret session ID, load the current device session, validate the credential hash, re-read the active membership and role assignments, perform one atomic rotation, and issue the access token only after the transaction succeeds.

- [ ] **Step 5: Implement idempotent logout**

Logout accepts the renewable credential so it still works after access expiry. A malformed or unknown credential returns the same successful result as an already-revoked credential; a valid current credential records `user_logout` and `revokedAt`.

- [ ] **Step 6: Add controller routes**

```text
POST /api/mobile/v1/session/refresh -> 200 MobileSessionIssueDto
POST /api/mobile/v1/session/logout  -> 200 { loggedOut: true }
```

Neither endpoint sets or clears a browser cookie.

- [ ] **Step 7: Run tests and typecheck**

Run: `npx vitest run apps/api/src/mobile/session/mobile-session.service.test.ts apps/api/src/mobile/session/mobile-device-session.repository.test.ts`

Expected: PASS.

Run: `npm run typecheck:api`

Expected: PASS.

- [ ] **Step 8: Commit session renewal**

```powershell
git add apps/api/src/mobile/session apps/api/src/mobile/mobile-api.module.ts
git commit -m "feat(api): rotate and revoke mobile sessions"
```

---

## Task 7: Add guarded bootstrap and secure role switching

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Create: `apps/api/src/mobile/common/mobile-request.ts`
- Create: `apps/api/src/mobile/session/mobile-session.guard.ts`
- Create: `apps/api/src/mobile/session/mobile-session.guard.test.ts`
- Modify: `apps/api/src/mobile/session/dto/mobile-session.dto.ts`
- Modify: `apps/api/src/mobile/session/mobile-session.service.ts`
- Modify: `apps/api/src/mobile/session/mobile-session.service.test.ts`
- Modify: `apps/api/src/mobile/session/mobile-session.controller.ts`
- Modify: `apps/api/src/mobile/mobile-api.module.ts`

- [ ] **Step 1: Write failing guard tests**

Test missing bearer token, wrong token type, unknown session, expired session, revoked session, membership deactivation, version mismatch, active-role mismatch, and successful request attachment. The request contract is:

```ts
export interface MobileAuthenticatedRequest extends FastifyRequest {
  mobileSession?: {
    sessionId: string;
    userId: string;
    membershipId: string;
    societyId: string;
    activeRole: MobileRole;
    activePermissionRole: string;
    version: number;
  };
  principal?: AuthenticatedPrincipal;
}
```

The attached principal contains only the active permission role, not every approved role.

- [ ] **Step 2: Write failing bootstrap and role-switch tests**

Assert that bootstrap:

- gets society from the device session, never from a header or body;
- returns both approved roles but only one active role;
- returns permissions for only the active permission role;
- returns the locked notification policy and foundation feature flags.

Assert that role switch:

- rejects a role not present in `SocietyRoleAssignment`;
- updates both canonical role and permission role;
- increments the session version;
- records an audit event with old role, new role, society, user, session, and request ID;
- issues a new access token/bootstrap;
- causes the previous access token to fail the guard version check.

- [ ] **Step 3: Run focused tests and confirm red**

Run: `npx vitest run apps/api/src/mobile/session/mobile-session.guard.test.ts apps/api/src/mobile/session/mobile-session.service.test.ts`

Expected: FAIL because guard, bootstrap, and role switch do not exist.

- [ ] **Step 4: Implement the guard**

Read only the `Authorization: Bearer` header. Verify the mobile access token, then load the database session, active membership, and matching non-revoked role assignment. Require equality for `sub`, `sid`, `societyId`, `membershipId`, `activeRole`, `activePermissionRole`, and `version` before attaching context.

- [ ] **Step 5: Add bootstrap DTOs and response**

The top-level bootstrap response is:

```ts
export class MobileBootstrapDto {
  user!: { id: string; name: string; email: string };
  society!: { id: string; name: string };
  approvedRoles!: MobileRole[];
  activeRole!: MobileRole;
  permissions!: PermissionAction[];
  featureFlags!: {
    residentShell: boolean;
    guardShell: boolean;
    nativePush: false;
    guardOffline: false;
  };
  notificationPolicy!: {
    critical: { enabled: true; configurable: false };
    transactional: { enabled: true; configurable: true };
    community: { enabled: false; configurable: true };
  };
}
```

- [ ] **Step 6: Add guarded routes**

```text
GET /api/mobile/v1/session/bootstrap    -> MobileBootstrapDto
PUT /api/mobile/v1/session/active-role  -> { accessToken, accessExpiresAt, bootstrap }
```

`active-role` accepts `{ role: "resident" | "guard" }`. Apply `MobileSessionGuard` to both routes. Do not accept `societyId`, `permissionRole`, or arbitrary permissions from the client.

- [ ] **Step 7: Run focused and permission regression tests**

Run: `npx vitest run apps/api/src/mobile/session/mobile-session.guard.test.ts apps/api/src/mobile/session/mobile-session.service.test.ts packages/security/src/permission-policy.test.ts`

Expected: PASS.

Run: `npm run typecheck:api`

Expected: PASS.

- [ ] **Step 8: Commit bootstrap and role switch**

```powershell
git add apps/api/src/mobile
git commit -m "feat(api): bootstrap mobile roles securely"
```

---

## Task 8: Lock the problem format and generated OpenAPI contract

**Repository:** `C:\Users\pawan\Projects\ReManageSociety`

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `apps/api/src/mobile/common/mobile-problem.filter.ts`
- Create: `apps/api/src/mobile/common/mobile-problem.filter.test.ts`
- Modify: `apps/api/src/mobile/auth/mobile-auth.controller.ts`
- Modify: `apps/api/src/mobile/session/mobile-session.controller.ts`
- Modify: `apps/api/src/mobile/mobile-api.module.ts`
- Create: `apps/api/src/openapi.ts`
- Modify: `apps/api/src/main.ts`
- Modify: `packages/sdk/package.json`
- Modify: `packages/sdk/scripts/generate-openapi-client.mjs`
- Create: `tests/contract/mobile-openapi-contract.test.ts`
- Create: `packages/sdk/generated/mobile-v1.openapi.json`
- Create: `packages/sdk/generated/mobile-v1.ts`

- [ ] **Step 1: Install the OpenAPI type generator**

Run: `npm install --save-dev openapi-typescript`

Expected: root manifest and lockfile update successfully.

- [ ] **Step 2: Write failing problem-response tests**

Assert that validation, unauthorized, forbidden, rate-limit, disabled-service, and internal errors have this public shape:

```ts
export interface MobileProblemBody {
  code: string;
  message: string;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
}
```

Internal errors use code `internal_error` and message `Something went wrong. Please try again.` They must not expose exception messages, stack traces, SQL, emails, OTP values, or credentials.

- [ ] **Step 3: Write the failing OpenAPI contract test**

Read `packages/sdk/generated/mobile-v1.openapi.json` and assert that it contains exactly these foundation paths:

```text
/api/mobile/v1/auth/password
/api/mobile/v1/auth/otp/request
/api/mobile/v1/auth/otp/verify
/api/mobile/v1/session/refresh
/api/mobile/v1/session/bootstrap
/api/mobile/v1/session/active-role
/api/mobile/v1/session/logout
```

Also assert that every operation has JSON request/response schemas, every guarded operation declares bearer auth, and no generated path begins with `/api/v1` or any legacy Next route.

- [ ] **Step 4: Run focused tests and confirm red**

Run: `npx vitest run apps/api/src/mobile/common/mobile-problem.filter.test.ts tests/contract/mobile-openapi-contract.test.ts`

Expected: FAIL because the filter and generated mobile contract do not exist.

- [ ] **Step 5: Implement and scope the mobile problem filter**

Register it only on the mobile controllers with `@UseFilters(MobileProblemFilter)`. Map `class-validator` failures into `fieldErrors`; map known domain codes explicitly; redact unknown errors. Keep the existing global `ProblemJsonFilter` unchanged for non-mobile endpoints.

- [ ] **Step 6: Extract reusable OpenAPI document construction**

Create `apps/api/src/openapi.ts`:

```ts
export function createSocietyOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Society Connect API")
    .setDescription("Web, backend, and dedicated ReManage mobile contracts.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
}
```

Update `main.ts` to call this function and retain `/docs` plus `/docs-json`.

- [ ] **Step 7: Complete the SDK generator**

Update `generate-openapi-client.mjs` to:

1. fetch `/docs-json` from `NEST_API_BASE_URL` or `http://localhost:4000`;
2. keep only paths beginning `/api/mobile/v1`;
3. preserve only referenced component schemas and security schemes;
4. sort path keys for deterministic output;
5. write `packages/sdk/generated/mobile-v1.openapi.json`;
6. invoke `openapi-typescript` to write `packages/sdk/generated/mobile-v1.ts`;
7. exit non-zero when no mobile path exists.

The generator must never hand-edit generated TypeScript.

- [ ] **Step 8: Generate the contract from a running local API**

In terminal A, from `ReManageSociety`:

```powershell
$env:MOBILE_API_ENABLED='true'
$env:MOBILE_BETA_SOCIETY_ID='society_beta'
$env:MOBILE_ACCESS_TOKEN_SECRET='development-mobile-access-secret-32-characters'
$env:MOBILE_REFRESH_TOKEN_PEPPER='development-mobile-refresh-pepper-32-characters'
$env:MOBILE_OTP_PEPPER='development-mobile-otp-pepper-32-characters'
npm run dev:api
```

Expected: `API listening on http://localhost:4000`.

In terminal B:

Run: `npm run sdk:generate`

Expected: both generated files are written and seven mobile paths are reported.

- [ ] **Step 9: Run contract tests and typechecks**

Run: `npx vitest run apps/api/src/mobile tests/contract/mobile-foundation-schema.test.ts tests/contract/mobile-openapi-contract.test.ts`

Expected: PASS.

Run: `npm run typecheck:api`

Expected: PASS.

Run: `npm run typecheck:sdk`

Expected: PASS.

- [ ] **Step 10: Commit the backend contract boundary**

```powershell
git add package.json package-lock.json apps/api/src/main.ts apps/api/src/openapi.ts apps/api/src/mobile packages/sdk/package.json packages/sdk/scripts/generate-openapi-client.mjs packages/sdk/generated tests/contract/mobile-openapi-contract.test.ts
git commit -m "feat(api): publish mobile v1 contract"
```

### Backend foundation checkpoint

Before starting mobile scaffolding, confirm:

```powershell
npm run db:validate
npm run typecheck:api
npm run typecheck:security
npm run typecheck:sdk
npx vitest run apps/api/src/mobile tests/contract/mobile-foundation-schema.test.ts tests/contract/mobile-openapi-contract.test.ts
```

Expected: every command passes. Do not proceed if the generated schema is missing an endpoint or includes a non-mobile path.

---

## Task 9: Scaffold the separate Expo SDK 57 application and test harness

**Repository:** `C:\Users\pawan\Projects\ReManage-app`

**Files:**

- Create from template: `.gitignore`, `app.json`, `eslint.config.js`, `expo-env.d.ts`, `package.json`, `tsconfig.json`, `assets/`
- Create during install: `package-lock.json`
- Create: `.env.example`
- Create: `jest.config.js`
- Create: `jest.setup.ts`
- Create: `src/platform/config/env.ts`
- Create: `src/platform/config/env.test.ts`
- Modify: `README.md`

- [ ] **Step 1: Confirm the repository boundary before scaffolding**

Run: `git status --short --branch`

Expected: the approved docs commits are present; `.superpowers/` may remain untracked. Record that it must not be copied, staged, removed, or committed.

- [ ] **Step 2: Generate the official template in a disposable directory**

Run from `C:\Users\pawan\Projects`:

```powershell
npx create-expo-app@latest C:\tmp\remanage-expo-foundation --template default@sdk-57 --no-install --no-agents-md
```

Expected: an Expo SDK 57 TypeScript/Expo Router project is generated under `C:\tmp\remanage-expo-foundation`; `ReManage-app` itself is not overwritten.

- [ ] **Step 3: Copy only the scaffold baseline into the existing repository**

Copy these exact entries from the disposable project into `ReManage-app`:

```text
.gitignore
app.json
assets
eslint.config.js
expo-env.d.ts
package.json
tsconfig.json
```

Do not copy the disposable `.git`, README, generated example `src`, agent instructions, or editor settings. Confirm `docs/` and `.superpowers/` are unchanged. Resolve the disposable path and verify it begins with `C:\tmp\remanage-expo-foundation` before deleting that directory.

- [ ] **Step 4: Lock the ReManage app identity and scripts**

Set `app.json` values:

```json
{
  "expo": {
    "name": "ReManage",
    "slug": "remanage",
    "scheme": "remanage",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "plugins": ["expo-router", "expo-secure-store"],
    "experiments": { "typedRoutes": true }
  }
}
```

Retain template-defined icon, splash, Android adaptive icon, iOS tablet support, and web settings. Do not add an Expo owner, project ID, bundle identifier, Android package, or EAS channel in this phase.

Set package scripts:

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest --runInBand",
  "typecheck": "tsc --noEmit",
  "lint": "expo lint",
  "bundle:check": "expo export --platform all"
}
```

- [ ] **Step 5: Install the template and foundation dependencies**

Run: `npm install`

Run: `npx expo install expo-secure-store expo-crypto expo-constants @react-native-community/netinfo`

Run: `npm install @tanstack/react-query openapi-fetch`

Run: `npm install --save-dev openapi-typescript`

On Windows, run exactly:

```powershell
npx expo install jest-expo jest @types/jest "--" --dev
npx expo install @testing-library/react-native "--" --dev
```

Expected: `package-lock.json` is created and `npx expo install --check` reports compatible Expo package versions.

- [ ] **Step 6: Write the failing environment test**

```ts
import { readPublicEnvironment } from "./env";

describe("public environment", () => {
  it("accepts only an HTTP API base URL", () => {
    expect(
      readPublicEnvironment({ EXPO_PUBLIC_API_BASE_URL: "https://api.remanage.test" }),
    ).toEqual({ apiBaseUrl: "https://api.remanage.test" });
  });

  it("rejects missing and non-HTTP values", () => {
    expect(() => readPublicEnvironment({})).toThrow("EXPO_PUBLIC_API_BASE_URL");
    expect(() =>
      readPublicEnvironment({ EXPO_PUBLIC_API_BASE_URL: "file:///tmp/api" }),
    ).toThrow("http or https");
  });
});
```

- [ ] **Step 7: Configure Jest and run the red test**

`jest.config.js`:

```js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.expo/", "/dist/"],
};
```

Run: `npm test -- src/platform/config/env.test.ts`

Expected: FAIL because `env.ts` does not exist.

- [ ] **Step 8: Implement static Expo public-environment access**

```ts
export interface PublicEnvironment {
  apiBaseUrl: string;
}

export function readPublicEnvironment(source: {
  EXPO_PUBLIC_API_BASE_URL?: string;
}): PublicEnvironment {
  const raw = source.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!raw) throw new Error("EXPO_PUBLIC_API_BASE_URL is required");
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL must use http or https");
  }
  return { apiBaseUrl: raw.replace(/\/$/, "") };
}

export const publicEnvironment = readPublicEnvironment({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
});
```

Add `.env.example`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

Do not commit `.env`, `.env.local`, or any server secret.

- [ ] **Step 9: Replace the minimal README**

Document Node LTS, `npm install`, copying `.env.example` to `.env.local`, `npm start`, test/typecheck/lint commands, the dedicated `/api/mobile/v1` dependency, and the explicit rule that this repository contains no backend or legacy API implementation.

- [ ] **Step 10: Run scaffold verification**

Run: `npm test -- src/platform/config/env.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npx expo install --check`

Expected: `Dependencies are up to date`.

- [ ] **Step 11: Commit the Expo baseline**

```powershell
git add .gitignore .env.example app.json assets eslint.config.js expo-env.d.ts package.json package-lock.json tsconfig.json jest.config.js jest.setup.ts src/platform/config README.md
git commit -m "feat(app): scaffold Expo mobile foundation"
```

Verify `git status --short` still shows `.superpowers/` as untracked and not staged.

---

## Task 10: Synchronize the OpenAPI contract and create the typed API client

**Repository:** `C:\Users\pawan\Projects\ReManage-app`

**Files:**

- Modify: `package.json`
- Create: `scripts/sync-api-contract.mjs`
- Create: `contracts/mobile-v1.openapi.json`
- Create: `src/platform/api/generated/mobile-v1.ts`
- Create: `src/platform/api/mobile-api-client.ts`
- Create: `src/platform/api/mobile-api-client.test.ts`

- [ ] **Step 1: Add deterministic contract scripts**

Add:

```json
{
  "api:sync": "node scripts/sync-api-contract.mjs && openapi-typescript contracts/mobile-v1.openapi.json -o src/platform/api/generated/mobile-v1.ts",
  "api:check": "node scripts/sync-api-contract.mjs --check"
}
```

- [ ] **Step 2: Write the failing API-client tests**

With a fake `fetch`, assert:

- password login posts only to `/api/mobile/v1/auth/password`;
- refresh posts only to `/api/mobile/v1/session/refresh`;
- bootstrap and role switch attach the supplied bearer token;
- no method accepts or sends `x-society-id`;
- JSON problem bodies become a typed `MobileApiError` with `status`, `code`, `message`, `requestId`, and `fieldErrors`;
- a non-JSON response becomes `invalid_server_response` without exposing response text.

- [ ] **Step 3: Run the focused test and confirm red**

Run: `npm test -- src/platform/api/mobile-api-client.test.ts`

Expected: FAIL because the generated contract and client do not exist.

- [ ] **Step 4: Implement contract synchronization**

`sync-api-contract.mjs` must:

1. read `MOBILE_OPENAPI_URL`, defaulting to `http://localhost:4000/docs-json`;
2. fetch JSON and fail on non-2xx;
3. retain only `/api/mobile/v1` paths;
4. sort paths and JSON keys deterministically;
5. write `contracts/mobile-v1.openapi.json` in normal mode;
6. in `--check` mode, compare generated JSON to the checked-in file and exit non-zero on drift;
7. fail if the filtered document contains zero paths.

Do not import or read files directly from the sibling backend repository. The served OpenAPI document is the repository boundary.

- [ ] **Step 5: Synchronize from the running backend**

Keep the Task 8 API process running, then execute:

Run: `npm run api:sync`

Expected: the checked-in OpenAPI snapshot and TypeScript `paths` type are generated with the seven foundation endpoints.

- [ ] **Step 6: Implement the typed wrapper**

Use `createClient<paths>` from `openapi-fetch`. Expose only these methods:

```ts
export interface MobileApi {
  passwordLogin(body: PasswordLoginBody): Promise<SessionIssue>;
  requestOtp(body: OtpRequestBody): Promise<OtpAccepted>;
  verifyOtp(body: OtpVerifyBody): Promise<SessionIssue>;
  refresh(renewableCredential: string): Promise<SessionIssue>;
  bootstrap(accessToken: string): Promise<Bootstrap>;
  switchRole(accessToken: string, role: MobileRole): Promise<RoleSwitchResult>;
  logout(renewableCredential: string): Promise<{ loggedOut: true }>;
}
```

Every generated-client call checks both `data` and `error`. The wrapper must not implement automatic refresh; single-flight refresh belongs to the session controller in Task 12.

- [ ] **Step 7: Run tests and contract check**

Run: `npm test -- src/platform/api/mobile-api-client.test.ts`

Expected: PASS.

Run: `npm run api:check`

Expected: PASS with no contract drift.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Commit the contract client**

```powershell
git add package.json scripts/sync-api-contract.mjs contracts/mobile-v1.openapi.json src/platform/api/generated/mobile-v1.ts src/platform/api/mobile-api-client.ts src/platform/api/mobile-api-client.test.ts
git commit -m "feat(app): generate mobile api client"
```

---

## Task 11: Add SecureStore credentials, installation identity, and session state

**Repository:** `C:\Users\pawan\Projects\ReManage-app`

**Files:**

- Create: `src/platform/auth/credential-store.ts`
- Create: `src/platform/auth/credential-store.test.ts`
- Create: `src/platform/auth/installation.ts`
- Create: `src/platform/auth/installation.test.ts`
- Create: `src/platform/auth/session-reducer.ts`
- Create: `src/platform/auth/session-reducer.test.ts`

- [ ] **Step 1: Write failing credential-store tests**

Mock `expo-secure-store` and assert:

- the renewable credential uses key `remanage.mobile.renewable-credential`;
- the installation ID uses key `remanage.mobile.installation-id`;
- writes use `SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY`;
- `clearCredentials` deletes the renewable credential but preserves the installation ID;
- `purgeDeviceState` deletes both keys;
- no method persists an access token or bootstrap payload.

- [ ] **Step 2: Write failing installation and reducer tests**

Assert that installation creation calls `Crypto.randomUUID()` only when no stored ID exists. Define reducer states:

```ts
export type SessionState =
  | { status: "restoring" }
  | { status: "signed_out"; reason?: string }
  | { status: "authenticated"; bootstrap: Bootstrap }
  | { status: "switching_role"; bootstrap: Bootstrap }
  | { status: "recoverable_error"; message: string };
```

Test valid transitions and reject attempts to make a signed-out state authenticated without a bootstrap payload.

- [ ] **Step 3: Run focused tests and confirm red**

Run: `npm test -- src/platform/auth/credential-store.test.ts src/platform/auth/installation.test.ts src/platform/auth/session-reducer.test.ts`

Expected: FAIL because all three modules are absent.

- [ ] **Step 4: Implement the SecureStore adapter**

Expose an injectable interface for tests:

```ts
export interface CredentialStore {
  getRenewableCredential(): Promise<string | null>;
  setRenewableCredential(value: string): Promise<void>;
  clearCredentials(): Promise<void>;
  getInstallationId(): Promise<string | null>;
  setInstallationId(value: string): Promise<void>;
  purgeDeviceState(): Promise<void>;
}
```

The production adapter wraps only `expo-secure-store`. Do not use AsyncStorage, localStorage, a source-code constant, or Expo public environment variables for credentials.

- [ ] **Step 5: Implement installation metadata**

`getOrCreateInstallation` returns:

```ts
export interface MobileInstallation {
  id: string;
  platform: "android" | "ios";
  appVersion: string;
  deviceName?: string;
}
```

Use `Platform.OS`, the required `Constants.expoConfig?.version` from `expo-constants`, and the stored random UUID. Throw a configuration error if the app version is absent. Reject web at runtime because the MVP binary targets Android and iOS.

- [ ] **Step 6: Implement the pure session reducer**

Keep tokens out of reducer state and React DevTools. Reducer actions may carry bootstrap and public error text only.

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test -- src/platform/auth/credential-store.test.ts src/platform/auth/installation.test.ts src/platform/auth/session-reducer.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Commit secure local state**

```powershell
git add src/platform/auth/credential-store.ts src/platform/auth/credential-store.test.ts src/platform/auth/installation.ts src/platform/auth/installation.test.ts src/platform/auth/session-reducer.ts src/platform/auth/session-reducer.test.ts
git commit -m "feat(app): protect native session state"
```

---

## Task 12: Implement session restoration, single-flight refresh, and role switching

**Repository:** `C:\Users\pawan\Projects\ReManage-app`

**Files:**

- Create: `src/platform/auth/session-controller.ts`
- Create: `src/platform/auth/session-controller.test.ts`
- Create: `src/platform/auth/session-provider.tsx`
- Create: `src/testing/fakes.ts`

- [ ] **Step 1: Write failing restoration tests**

Using fake API and credential store implementations, assert:

- no stored credential transitions directly from `restoring` to `signed_out`;
- a stored credential calls refresh, immediately persists the rotated credential, then calls bootstrap with the access token;
- bootstrap data becomes the authenticated state;
- refresh rejection deletes the credential and signs out;
- a SecureStore write failure signs out and does not continue with an unpersisted rotated credential;
- two simultaneous authorized operations share one refresh promise;
- a 401 causes at most one refresh and one retry, never a loop.

- [ ] **Step 2: Write failing login, switch, and logout tests**

Assert:

- password and OTP verification persist the renewable credential before bootstrap;
- OTP request stores no credential;
- role switch enters `switching_role`, accepts only the server bootstrap, clears the old access token, then stores the new access token in memory;
- online logout calls the API before clearing credentials;
- failed online logout still clears local credentials and returns signed-out state;
- no public context value exposes either credential.

- [ ] **Step 3: Run the focused test and confirm red**

Run: `npm test -- src/platform/auth/session-controller.test.ts`

Expected: FAIL because the controller does not exist.

- [ ] **Step 4: Implement the controller with an in-memory access token**

Required public API:

```ts
export interface SessionController {
  getState(): SessionState;
  subscribe(listener: (state: SessionState) => void): () => void;
  restore(): Promise<void>;
  signInWithPassword(identifier: string, password: string): Promise<void>;
  requestOtp(identifier: string): Promise<{ challengeId: string }>;
  verifyOtp(challengeId: string, code: string): Promise<void>;
  switchRole(role: MobileRole): Promise<void>;
  logout(): Promise<void>;
}
```

Keep `accessToken`, `accessExpiresAt`, and the active refresh promise as private class fields. Centralize `acceptSessionIssue` so every login/refresh path persists the rotated credential before using the access token.

- [ ] **Step 5: Implement one-refresh retry semantics**

Create one private `refreshInFlight: Promise<void> | null`. Any caller that needs renewal reuses it. Clear it in `finally`. If refresh fails, purge credentials and dispatch signed out. An operation may retry once after a successful refresh; it must surface the second 401.

- [ ] **Step 6: Bind the controller to React**

`SessionProvider` subscribes through `useSyncExternalStore` and exposes:

```ts
export interface SessionContextValue {
  state: SessionState;
  retryRestore(): Promise<void>;
  signInWithPassword(identifier: string, password: string): Promise<void>;
  requestOtp(identifier: string): Promise<{ challengeId: string }>;
  verifyOtp(challengeId: string, code: string): Promise<void>;
  switchRole(role: MobileRole): Promise<void>;
  logout(): Promise<void>;
}
```

Call `restore()` once when the provider mounts. Do not expose token getters through context.

- [ ] **Step 7: Run focused tests and typecheck**

Run: `npm test -- src/platform/auth/session-controller.test.ts src/platform/auth/session-reducer.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Commit the session runtime**

```powershell
git add src/platform/auth/session-controller.ts src/platform/auth/session-controller.test.ts src/platform/auth/session-provider.tsx src/testing/fakes.ts
git commit -m "feat(app): restore and switch mobile sessions"
```

---

## Task 13: Build password and email-OTP authentication screens

**Repository:** `C:\Users\pawan\Projects\ReManage-app`

**Files:**

- Create: `src/app/(auth)/_layout.tsx`
- Create: `src/app/(auth)/sign-in.tsx`
- Create: `src/app/(auth)/otp.tsx`
- Create: `src/features/auth/password-sign-in-screen.tsx`
- Create: `src/features/auth/password-sign-in-screen.test.tsx`
- Create: `src/features/auth/otp-verify-screen.tsx`
- Create: `src/features/auth/otp-verify-screen.test.tsx`
- Create: `src/platform/theme/tokens.ts`

- [ ] **Step 1: Write failing password-screen tests**

Render with a fake session context and assert:

- email and password are required;
- email is normalized before submission;
- the password field uses `secureTextEntry`;
- `Sign in` calls `signInWithPassword` once and disables duplicate submission;
- `Email me a code` calls `requestOtp` without requiring a password and navigates with only the opaque `challengeId`;
- invalid credentials show generic text;
- there is no signup, registration, society selection, or manual role selection control.

- [ ] **Step 2: Write failing OTP-screen tests**

Assert:

- exactly six numeric characters are accepted;
- submit calls `verifyOtp(challengeId, code)` once;
- challenge expiry/invalid-code messages remain generic;
- no OTP value is logged or persisted;
- back navigation returns to sign-in without signing out another session.

- [ ] **Step 3: Run focused tests and confirm red**

Run: `npm test -- src/features/auth/password-sign-in-screen.test.tsx src/features/auth/otp-verify-screen.test.tsx`

Expected: FAIL because the screens do not exist.

- [ ] **Step 4: Create shared foundation design tokens**

```ts
export const colors = {
  cream: "#FEFDDF",
  orange: "#FF5400",
  yellow: "#FFBE00",
  charcoal: "#333333",
  white: "#FFFFFF",
  danger: "#B42318",
} as const;

export const residentTheme = {
  background: colors.cream,
  surface: colors.white,
  text: colors.charcoal,
  accent: colors.orange,
  highlight: colors.yellow,
} as const;

export const guardTheme = {
  background: colors.charcoal,
  surface: "#242424",
  text: colors.cream,
  accent: colors.orange,
  highlight: colors.yellow,
} as const;
```

Use at least 48-by-48 point touch targets, visible focus/pressed states, accessible labels, and system font fallback. Do not import web CSS or copy web components.

- [ ] **Step 5: Implement the sign-in screen**

Use one screen with two explicit actions: password sign-in and email-code request. Show ReManage branding, state that accounts are provided by society management, and use `keyboardType="email-address"`, `autoCapitalize="none"`, and relevant autofill hints.

The route file only adapts navigation:

```tsx
export default function SignInRoute() {
  const router = useRouter();
  return (
    <PasswordSignInScreen
      onOtpChallenge={(challengeId) =>
        router.push({ pathname: "/(auth)/otp", params: { challengeId } })
      }
    />
  );
}
```

- [ ] **Step 6: Implement OTP verification**

Read only `challengeId` from route parameters. Keep the entered code in local component state, set numeric keyboard/one-time-code autofill hints, and clear the code after a rejected attempt.

- [ ] **Step 7: Run screen tests and accessibility checks**

Run: `npm test -- src/features/auth/password-sign-in-screen.test.tsx src/features/auth/otp-verify-screen.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 8: Commit authentication UI**

```powershell
git add 'src/app/(auth)' src/features/auth src/platform/theme/tokens.ts
git commit -m "feat(app): add existing-account login flows"
```

---

## Task 14: Enforce separate Resident and Guard navigation shells

**Repository:** `C:\Users\pawan\Projects\ReManage-app`

**Files:**

- Create: `src/platform/query/query-client.ts`
- Create: `src/platform/query/react-native-query-lifecycle.tsx`
- Create: `src/app/_layout.tsx`
- Create: `src/app/index.tsx`
- Create: `src/app/navigation-contract.test.ts`
- Create: `src/app/(resident)/_layout.tsx`
- Create: `src/app/(resident)/(tabs)/_layout.tsx`
- Create: `src/app/(resident)/(tabs)/index.tsx`
- Create: `src/app/(resident)/(tabs)/visitors.tsx`
- Create: `src/app/(resident)/(tabs)/bills.tsx`
- Create: `src/app/(resident)/(tabs)/more.tsx`
- Create: `src/app/(guard)/_layout.tsx`
- Create: `src/app/(guard)/(tabs)/_layout.tsx`
- Create: `src/app/(guard)/(tabs)/index.tsx`
- Create: `src/app/(guard)/(tabs)/parcels.tsx`
- Create: `src/app/(guard)/(tabs)/incidents.tsx`
- Create: `src/app/(guard)/(tabs)/more.tsx`
- Create: `src/features/session/role-switcher.tsx`
- Create: `src/features/session/role-switcher.test.tsx`
- Create: `src/features/resident/resident-shell-screen.tsx`
- Create: `src/features/guard/guard-shell-screen.tsx`

- [ ] **Step 1: Write the failing navigation contract test**

Read both tab layout source files and assert:

```ts
const residentLabels = ["Home", "Visitors", "Bills", "More"];
const guardLabels = ["Gate", "Parcels", "Incidents", "More"];
```

The Resident layout must contain all resident labels and none of `Gate`, `Parcels`, or `Incidents`. The Guard layout must contain all guard labels and none of `Home`, `Visitors`, or `Bills`. Root layout must use two separate `Stack.Protected` guards. No route or screen may contain `combined dashboard` or a role supplied from route parameters.

- [ ] **Step 2: Write failing role-switcher tests**

Assert:

- it renders nothing for one approved role;
- a dual-role Resident sees only `Switch to Guard`;
- a dual-role Guard sees only `Switch to Resident`;
- selection calls `switchRole` once and blocks double taps;
- navigation changes only after the server returns a bootstrap with the requested active role;
- failure preserves the original role shell.

- [ ] **Step 3: Run focused tests and confirm red**

Run: `npm test -- src/app/navigation-contract.test.ts src/features/session/role-switcher.test.tsx`

Expected: FAIL because layouts and role switcher do not exist.

- [ ] **Step 4: Configure Query lifecycle for React Native**

Create one `QueryClient` with query retries limited to one for transient failures and zero for 401/403. Wire `onlineManager` to NetInfo and `focusManager` to `AppState`. Wrap the router in `QueryClientProvider`, then `SessionProvider`.

- [ ] **Step 5: Protect the route groups from server state**

The root navigator must use the authenticated bootstrap, not a locally chosen role:

```tsx
function RootNavigator() {
  const { state } = useSession();
  if (state.status === "restoring" || state.status === "switching_role") {
    return <SessionTransitionScreen />;
  }

  if (state.status === "recoverable_error") {
    return <SessionRecoveryScreen message={state.message} />;
  }

  const authenticated = state.status === "authenticated";
  const role = authenticated ? state.bootstrap.activeRole : null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={state.status === "signed_out"}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated && role === "resident"}>
        <Stack.Screen name="(resident)" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated && role === "guard"}>
        <Stack.Screen name="(guard)" />
      </Stack.Protected>
    </Stack>
  );
}
```

Define `SessionTransitionScreen` and `SessionRecoveryScreen` as non-route components in `_layout.tsx`. The recovery surface calls `retryRestore`; it must not expose either role tree while session authority is unknown.

Keep the splash/loading surface visible during restoration. Do not render either role tree underneath it.

- [ ] **Step 6: Create the exact tab shells**

Use `Tabs` from `expo-router`, not direct `@react-navigation` imports. Resident routes are `index`, `visitors`, `bills`, and `more`. Guard routes are `index`, `parcels`, `incidents`, and `more`. Each route imports a role-specific foundation surface; it may state that the module arrives in a later phase but must not simulate business data.

- [ ] **Step 7: Implement secure role switching and cache reset**

After `switchRole` returns a verified bootstrap:

1. clear the TanStack Query cache;
2. replace the router destination with `/(resident)` or `/(guard)` derived from the returned role;
3. never preserve the prior navigation history;
4. never reuse prior-role feature data.

The role switcher appears in both `More` routes only when `approvedRoles.length > 1`.

- [ ] **Step 8: Run navigation tests and complete mobile regressions**

Run: `npm test -- src/app/navigation-contract.test.ts src/features/session/role-switcher.test.tsx`

Expected: PASS.

Run: `npm test`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 9: Commit role-aware navigation**

```powershell
git add src/app src/platform/query src/features/session src/features/resident src/features/guard
git commit -m "feat(app): separate resident and guard shells"
```

---

## Task 15: Verify the complete foundation gate

**Repositories:** both repositories; make no feature changes during this task.

**Files:**

- Modify only when a verification failure identifies a defect in a file already owned by Tasks 1–14.

- [ ] **Step 1: Apply the migration to a disposable or beta-staging database**

From `ReManageSociety`, with `DATABASE_URL` and `DIRECT_URL` pointing to the test target:

Run: `npx prisma migrate status`

Expected: the migration history is valid and only the new mobile migration is pending before deployment.

Run: `npm run db:migrate:deploy`

Expected: `20260713090000_mobile_foundation` applies successfully.

Run: `npx prisma migrate status`

Expected: `Database schema is up to date!`

- [ ] **Step 2: Run backend verification from a fresh command prompt**

```powershell
npm run db:validate
npm run db:generate
npm run typecheck:config
npm run typecheck:security
npm run typecheck:api
npm run typecheck:sdk
npx vitest run apps/api/src/mobile tests/contract/mobile-foundation-schema.test.ts tests/contract/mobile-openapi-contract.test.ts
```

Expected: every command exits 0.

- [ ] **Step 3: Verify backend isolation**

Run: `rg -n "UserSession|createSession\(|cookies\(" apps/api/src/mobile`

Expected: no matches.

Run: `rg -n "renewableCredential\s+String|refreshToken\s+String" prisma/schema.prisma`

Expected: no plaintext credential field matches.

Run: `rg -n "api/mobile/v1" src/app/api`

Expected: no legacy Next API route implements or proxies the mobile boundary.

- [ ] **Step 4: Re-synchronize the mobile contract**

Start the Nest API with the enabled development mobile environment from Task 8. From `ReManage-app`:

Run: `npm run api:sync`

Run: `npm run api:check`

Expected: both pass and `git diff --exit-code -- contracts/mobile-v1.openapi.json src/platform/api/generated/mobile-v1.ts` produces no diff after the generated files are staged or committed.

- [ ] **Step 5: Run all mobile verification**

From `ReManage-app`:

```powershell
npm test
npm run typecheck
npm run lint
npx expo install --check
npm run bundle:check
```

Expected: Jest passes, TypeScript and lint exit 0, Expo dependencies are compatible, and Android/iOS/web bundles export successfully.

- [ ] **Step 6: Verify mobile boundary and product exclusions**

Run: `rg -n "/api/" src --glob "*.ts" --glob "*.tsx"`

Expected: every API path begins `/api/mobile/v1` and is centralized in `mobile-api-client.ts` or generated types.

Run: `rg -n "sign.?up|register|create account" src --ignore-case`

Expected: no signup or registration UI/route matches.

Run: `rg -n "x-society-id|UserSession|sessionToken" src`

Expected: no matches.

- [ ] **Step 7: Review both diffs before final commits**

From each repository, run:

```powershell
git status --short
git diff --check
git diff --stat
```

Expected: only planned files are changed; `ReManage-app/.superpowers/` remains untracked and unstaged.

- [ ] **Step 8: Make any verification-fix commits per repository**

Use a focused message naming the defect. Do not squash backend and mobile histories together.

### Native-runtime entry check for the next plan

Expo's current SDK 57 transition requires a development build for reliable physical-device testing, while EAS project linking and development-build authorization are deliberately deferred. The next shared-platform plan must begin by creating that authorized build and then run this checklist before push or business-feature work:

1. Password-login as Resident and confirm only Resident tabs appear.
2. Log out, request an email OTP, verify it, kill/restart the app, and confirm session restoration returns to Resident.
3. Reuse the consumed OTP and confirm rejection.
4. On a dual-role fixture, switch to Guard and confirm the Resident tree/history disappears.
5. Replay the access token issued before the switch and confirm the API returns 401.
6. Switch back to Resident and confirm Guard tree/history disappears.
7. Reuse a rotated renewable credential and confirm the device session is revoked and the app purges local credentials.
8. Log out online and confirm a cold launch opens sign-in.
9. Try an account outside the beta society and confirm generic invalid-credentials behaviour.
10. Inspect server logs and confirm no password, OTP, access token, renewable credential, or SMTP body appears.

---

## Self-review checklist before execution handoff

- [ ] Every endpoint in the approved foundation scope has a DTO, test, and generated OpenAPI operation.
- [ ] Mobile paths are isolated under `/api/mobile/v1`.
- [ ] The existing browser login, `UserSession`, Keycloak verifier, BFF bridge, and `/api/v1` controllers remain compatible.
- [ ] Multi-role authorization comes from normalized server records and active membership, never client state.
- [ ] Access-token versioning invalidates old tokens after role switch or session replacement.
- [ ] Renewable credentials are high-entropy, rotated, HMAC-hashed, revocable, and never logged.
- [ ] OTP is email-only for this phase, generic for unknown accounts, short-lived, single-use, attempt-limited, and rate-limited.
- [ ] Only the renewable credential and installation ID enter SecureStore.
- [ ] Resident and Guard route trees are distinct and mutually protected.
- [ ] No push, offline, workflow, EAS, TestFlight, or public-store work leaked into the foundation phase.
- [ ] All code examples use concrete names and values; no implementation decision remains unspecified inside this plan.

## Ordered follow-on plans after this gate passes

1. Shared mobile platform: native push registration/delivery, deep-link authorization, notification policy/preferences, observability, and EAS development-build setup.
2. Complete Guard scope: Gate, parcels, incidents, shifts, SOS/notices, 24-hour limited offline cache, queued visitor entry/exit, idempotent sync, logout purge.
3. Resident Wave 1: Home, visitors, bills/receipts, complaints, notices, SOS, profile, contacts, documents, and UPI/UTR Pending verification with web-route hardening.
4. Resident Wave 2: amenities, events, community, parking, and domestic staff.
5. Resident Wave 3: polls, expanded documents, NOC, and move-in/move-out.
6. Beta hardening: one-society fixtures, EAS internal Android distribution, TestFlight, telemetry, crash/flow/offline metrics, four-week cohort operations, and graduation review.

Do not start a follow-on plan until this foundation acceptance gate passes and its implementation is reviewed.
