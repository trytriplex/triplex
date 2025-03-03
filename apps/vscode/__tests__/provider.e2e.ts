/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("default props set in editor", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const { panels } = vsce.resolveEditor();

  await expect(panels.getByLabel("barbar")).toHaveValue("1");
  await expect(panels.getByLabel("batbat")).toHaveValue("100");
  await expect(panels.getByLabel("bazbaz")).toHaveValue("jelly");
  await expect(panels.getByLabel("bgColor")).toHaveValue("#cccccc");
});

test("default props set in scene", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const { scene } = vsce.resolveEditor();

  const element = scene.locator.getByTestId("provider-props");
  await expect(element).toContainText(`"barbar":"baz"`);
  await expect(element).toContainText(`"batbat":100`);
  await expect(element).toContainText(`"bazbaz":"jelly"`);
  await expect(element).toContainText(`"foofoo":true`);
  await expect(element).toContainText(`"bgColor":"#ccc"`);
});

test("set and reset canvas provider props", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const { panels, scene } = vsce.resolveEditor();
  const input = panels.getByLabel("batbat", { exact: true });
  await input.fill("222");
  await input.press("Enter");

  // Double check the value was set in the editor and scene
  const element = scene.locator.getByTestId("provider-props");
  await expect(element).toContainText(`"batbat":222`);
  await expect(panels.getByLabel("batbat")).toHaveValue("222");

  // Reset all provider props
  await panels
    .getByRole("button", { name: "Reset All Provider Props" })
    .click();

  // Double check the value was cleared in the editor and scene
  await expect(element).toContainText(`"batbat":100`);
  await expect(panels.getByLabel("batbat")).toHaveValue("100");
});

test("set and reset global provider props", async ({ vsce }) => {
  await vsce.codelens("Scene").click();
  const { panels, scene } = vsce.resolveEditor();
  const input = panels.getByLabel("theme");
  // Assert the initial default values
  await expect(input).toHaveValue("0");
  await input.selectOption("gitplex");

  // Double check the value was set in the editor and scene
  await expect(scene.locator.locator("html")).toHaveAttribute(
    "data-test-theme",
    "gitplex",
  );
  await expect(input).toHaveValue("1");

  // Reset all provider props
  await panels
    .getByRole("button", { name: "Reset All Provider Props" })
    .click();

  // Double check the value was cleared in the editor and scene
  await expect(input).toHaveValue("0");
  await expect(scene.locator.locator("html")).toHaveAttribute(
    "data-test-theme",
    "triplex",
  );
});

test("provider controls persist changes when panel is closed", async ({
  vsce,
}) => {
  await vsce.codelens("Scene").click();
  const { panels, panelsButton, scene } = vsce.resolveEditor();
  const input = panels.getByLabel("batbat", { exact: true });
  await input.fill("222");
  await input.press("Enter");

  await panelsButton.click();
  await panelsButton.click();

  const element = scene.locator.getByTestId("provider-props");
  await expect(element).toContainText(`"batbat":222`);
  await expect(panels.getByLabel("batbat")).toHaveValue("222");
});

test("provider controls persist changes when an element is selected", async ({
  vsce,
}) => {
  await vsce.codelens("Scene").click();
  const { panels, scene } = vsce.resolveEditor();
  const input = panels.getByLabel("batbat", { exact: true });
  await input.fill("222");
  await input.press("Enter");

  await panels.getByRole("button", { name: "ambientLight" }).click();
  await expect(panels.getByLabel("scale")).toBeVisible();
  await vsce.page.keyboard.press("Escape");

  const element = scene.locator.getByTestId("provider-props");
  await expect(element).toContainText(`"batbat":222`);
  await expect(panels.getByLabel("batbat")).toHaveValue("222");
});
