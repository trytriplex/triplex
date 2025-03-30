/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("fg environment is correct", { tag: "@vsce_smoke" }, async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const { locator, scene } = vsce.resolveEditor();

  const fgUser = await locator.locator("html").getAttribute("data-fg-user");

  expect(fgUser).not.toBeNull();
  await expect(locator.locator("html")).toHaveAttribute(
    "data-fg-env",
    process.env.SMOKE_TEST ? "production" : "local",
  );
  await expect(scene.locator.locator("html")).toHaveAttribute(
    "data-fg-env",
    process.env.SMOKE_TEST ? "production" : "local",
  );
  await expect(scene.locator.locator("html")).toHaveAttribute(
    "data-fg-user",
    `${fgUser}`,
  );
});
