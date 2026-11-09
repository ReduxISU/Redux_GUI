// Runs Tools/check-visualization-coverage.mjs under `node --test`, so `rbs unit-test` (which runs
// `npm test`) gates on it and its report counts it as a test. The checker stays a plain script
// so `npm run check:visualizations` keeps working on its own.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("every visualization type in the manifest has a renderer, and no registry key is stale", () => {
  const run = spawnSync(process.execPath, ["Tools/check-visualization-coverage.mjs"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
});
