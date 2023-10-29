/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: !!process.env.CI,

  fullyParallel: false,

  projects: [
    {
      expect: {
        toMatchSnapshot: {
          maxDiffPixelRatio: 0.05,
        },
      },
      name: "app",
      snapshotPathTemplate: "{testDir}/__snapshots__/{testFileName}-{arg}{ext}",
      testMatch: /e2e\.ts$/,
    },
  ],

  reporter: "html",

  retries: process.env.CI ? 2 : 0,

  testDir: "./__tests__",

  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },

  workers: 1,
});
