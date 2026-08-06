// Integration-test config. See TESTING.md for how to run these.
//
// There is deliberately NO `webServer` block: the GUI and the Redux backend are brought up as
// containers by `rbs integration-test`, which then passes their address in RBS_BASE_URL. Booting
// a server here too would mean two different ways to start the stack, which is exactly the drift
// the build system exists to prevent. The localhost fallback is for the fast local loop where you
// have already started a stack by hand.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  // The app fetches everything client-side after load (7 batch calls before the first row can
  // render), so the default 5s expect timeout is too tight for a cold backend.
  expect: { timeout: 15000 },
  use: {
    baseURL: process.env.RBS_BASE_URL ?? "http://localhost:3000",
    // Kept on first retry only in local runs; in CI every failure gets a trace to open with
    // `npx playwright show-trace`.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
