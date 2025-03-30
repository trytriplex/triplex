/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test(
  "fg environment is correct",
  { tag: "@electron_smoke" },
  async ({ electron }) => {
    await expect(electron.scene.locator("html")).toHaveAttribute(
      "data-fg-env",
      process.env.SMOKE_TEST ? "production" : "local",
    );
  },
);
