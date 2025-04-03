/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { overrideFg, test } from "./utils/runner";

overrideFg("xr_editing", true);

test("webxr panel ready", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const { locator } = vsce.resolveEditor();

  await locator.getByRole("button", { name: "Open in WebXR" }).click();

  await expect(locator.getByTestId("webxr-dialog-open-device")).toBeVisible();
});

test.describe(() => {
  test.use({
    filename: "examples-private/react-only/src/app.tsx",
  });

  test("webxr panel needs setup", async ({ vsce }) => {
    await vsce.codelens("ReactOnly").click();
    const { locator } = vsce.resolveEditor();

    await locator.getByRole("button", { name: "Open in WebXR" }).click();

    await expect(locator.getByTestId("webxr-dialog-needs-setup")).toBeVisible();
  });
});
