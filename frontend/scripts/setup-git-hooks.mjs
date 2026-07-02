#!/usr/bin/env node
// Point git at the repo's ../.husky hooks dir. Runs automatically via the frontend `prepare`
// npm lifecycle script, so a fresh `npm install` wires up the pre-commit schema-sync hook for
// every clone/teammate without a manual git-config step.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(frontendDir, "..");

if (!existsSync(path.join(repoRoot, ".git"))) {
  process.exit(0); // not a git checkout (e.g. a packaged archive) — nothing to wire up
}

try {
  execSync("git config core.hooksPath .husky", { cwd: repoRoot, stdio: "inherit" });
} catch {
  // Best-effort — don't fail `npm install` over hook wiring.
}
