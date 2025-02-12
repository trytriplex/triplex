/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe(() => {
  test.use({
    filename: "examples-private/test-fixture/src/geometry/syntax-error.tsx",
  });

  test("should show syntax error splash when opening", async ({ vsce }) => {
    await vsce.codelens("SyntaxError", { skipWait: true }).click();
    const { locator } = vsce.resolveEditor();

    await expect(locator.getByTestId("InvalidCodeSplash")).toHaveText(
      /There was an error parsing this file/,
    );
  });
});

test("should recover from initial syntax error", async ({ setFile, vsce }) => {
  await setFile((file) => "{" + file);
  await vsce.codelens("Plane", { skipWait: true }).click();
  const { locator } = vsce.resolveEditor();

  await expect(locator.getByTestId("InvalidCodeSplash")).toHaveText(
    /There was an error parsing this file/,
  );
  await setFile((file) => file.replace("{", ""));

  await expect(locator.getByTestId("InvalidCodeSplash")).toBeHidden();
  await expect(vsce.loadedComponent).toHaveText("Plane");
});

test("should recover from subsequent syntax error", async ({
  setFile,
  vsce,
}) => {
  await vsce.codelens("Plane").click();
  const { locator } = vsce.resolveEditor();

  await setFile((file) => "{" + file);
  await expect(locator.getByTestId("InvalidCodeSplash")).toHaveText(
    /There was an error parsing this file/,
  );
  await setFile((file) => file.replace("{", ""));

  await expect(locator.getByTestId("InvalidCodeSplash")).toBeHidden();
  await expect(vsce.loadedComponent).toHaveText("Plane");
});
