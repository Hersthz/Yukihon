#!/usr/bin/env node
// Regenerate src/api/schema.d.ts from the backend's live OpenAPI docs. Invoked by the
// .husky/pre-commit hook whenever a commit touches backend Java sources, so nobody has to
// remember to run `npm run gen:api` by hand. Silently skips (never blocks the commit) when the
// backend isn't running locally — path-resolved from this file's location, so it works whether
// it's invoked from the repo root (git hook) or from frontend/ (manual `npm run sync:schema`).
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(frontendDir, "..");
const schemaFromRoot = path.relative(repoRoot, path.join(frontendDir, "src/api/schema.d.ts"));

const API_DOCS_URL = "http://localhost:8080/v3/api-docs";
const TIMEOUT_MS = 1500;

async function backendReachable() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(API_DOCS_URL, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

const reachable = await backendReachable();
if (!reachable) {
  console.warn(
    `[sync-schema] Backend not reachable at ${API_DOCS_URL} — skipping schema.d.ts refresh.\n` +
      "[sync-schema] Start the backend, then commit again (or run `npm run gen:api` in frontend/) once it's up."
  );
  process.exit(0);
}

console.log("[sync-schema] Backend detected — regenerating src/api/schema.d.ts …");
execSync("npm run gen:api", { cwd: frontendDir, stdio: "inherit" });

try {
  execSync(`git add "${schemaFromRoot}"`, { cwd: repoRoot, stdio: "inherit" });
  console.log("[sync-schema] schema.d.ts refreshed and staged.");
} catch {
  console.log("[sync-schema] schema.d.ts refreshed.");
}
