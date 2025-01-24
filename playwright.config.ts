/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  fullyParallel: false,
  globalSetup: "./test/playwright-setup",
  projects: [
    {
      expect: {
        timeout: 60_000,
      },
      name: "electron",
      testDir: "./apps/electron/__tests__",
    },
    {
      expect: {
        timeout: 60_000,
      },
      name: "vscode",
      testDir: "./apps/vscode/__tests__",
    },
  ],
  reporter: process.env.CI
    ? [
        [
          "blob",
          {
            fileName: process.env.PWTEST_BLOB_NAME
              ? `report-${process.env.PWTEST_BLOB_NAME}.zip`
              : undefined,
          },
        ],
      ]
    : "html",
  retries: process.env.CI ? 2 : 0,
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFileName}-{arg}{ext}",
  testMatch: /e2e\.ts$/,
  timeout: 120_000,
  use: {
    trace: {
      mode: "on-first-retry",
    },
  },
  workers: 1,
});
