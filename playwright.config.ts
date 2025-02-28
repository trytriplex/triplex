/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
  maxFailures: process.env.CI ? 5 : undefined,
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
