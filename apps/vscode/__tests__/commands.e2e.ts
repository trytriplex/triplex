/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("fill number input", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const { panels } = vsce.resolveEditor();
  await panels.getByRole("button", { name: "planeGeometry" }).click();
  const input = panels.getByLabel("width", { exact: true });

  await input.fill("0.5");
  await input.press("Enter");

  // Escape should blur the input.
  await expect(input).not.toBeFocused();
  await expect(input).toHaveValue("0.5");
});

test("drag to change number input", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const { panels } = vsce.resolveEditor();
  await panels.getByRole("button", { name: "planeGeometry" }).click();
  const input = panels.getByLabel("width", { exact: true });

  await vsce.dismissAllNotifications();
  await input.dragTo(input, { force: true, targetPosition: { x: 100, y: 0 } });

  // Escape should blur the input.
  await expect(input).not.toBeFocused();
  await expect(input).toHaveValue("0.44");
});

test("delete element", async ({ vsce }) => {
  await vsce.codelens("Plane").click();
  const { panels } = vsce.resolveEditor();
  await panels.getByRole("button", { name: "planeGeometry" }).click();
  await expect(
    panels.getByRole("button", { name: "planeGeometry" }),
  ).toHaveAccessibleName(/selected/);

  await vsce.page.keyboard.press("Backspace");

  await expect(panels).not.toContainText("planeGeometry");
});

test("backspacing in an input does not delete the element", async ({
  vsce,
}) => {
  await vsce.codelens("Plane").click();
  const { panels } = vsce.resolveEditor();
  await panels.getByRole("button", { name: "planeGeometry" }).click();
  const input = panels.getByLabel("width", { exact: true });
  await input.fill("0.5");

  // Delay the press so there is enough time to see a deletion if a regression occurs.
  await input.press("Backspace", { delay: 500 });

  await expect(panels).toContainText("planeGeometry");
});

test.describe(() => {
  test.use({
    filename: "examples-private/test-fixture/src/component-roots.tsx",
  });

  test("updating children prop", async ({ getFile, vsce }) => {
    await vsce.codelens("ReactRootFromAnotherModule").click();

    const { panels } = vsce.resolveEditor();
    await panels.getByRole("button", { name: "Button" }).click();
    const input = panels.getByLabel("children", { exact: true });

    await input.fill("foo__bar");
    await input.press("Enter");

    await expect(vsce.tab("component-roots.tsx")).toHaveClass(/dirty/);
    await vsce.page.keyboard.press("ControlOrMeta+S");

    await expect.poll(() => getFile()).toContain("foo__bar");
  });
});
