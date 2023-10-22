/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { defineConfig } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  forbidOnly: !!process.env.CI,

  fullyParallel: true,

  projects: [
    {
      name: "app",
      testMatch: /e2e.ts$/,
    },
  ],

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  testDir: "./__tests__",

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
});
