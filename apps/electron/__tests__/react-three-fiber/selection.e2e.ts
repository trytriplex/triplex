/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("select custom component", async ({ electron }) => {
  await electron.waitForScene();

  await electron.frame.click();

  await expect(electron.contextPanel.heading).toHaveText("Box");
});

test("select element behind", async ({ electron }) => {
  await electron.waitForScene();

  await electron.frame.locator.dblclick({ delay: 100, force: true });

  await expect(electron.contextPanel.heading).toHaveText("mesh");
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Camera",
      path: "src/zcamera.tsx",
    },
  });

  test("select camera component", async ({ electron }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.heading).toHaveText("PerspectiveCamera");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "default",
      path: "src/geometry/box.tsx",
    },
  });

  test("select host element mesh", async ({ electron }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.heading).toHaveText("mesh");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Light",
      path: "src/geometry/light.tsx",
    },
  });

  test("select host element light", async ({ electron }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.heading).toHaveText("ambientLight");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "UIKitExample",
      path: "src/uikit.tsx",
    },
  });

  test("select node module component using automatic runtime", async ({
    electron,
  }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.heading).toHaveText("Portal");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "ThirdParty",
      path: "src/third-party.tsx",
    },
  });

  test("select node module component using classic runtime", async ({
    electron,
  }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.heading).toHaveText("Box");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Scene",
      path: "src/geometry/nested-same-file.tsx",
    },
  });

  test(
    "select component in scene of deeply nested component",
    { tag: "@electron_smoke" },
    async ({ electron }) => {
      await electron.waitForScene();

      await electron.frame.click();

      await expect(electron.contextPanel.heading).toHaveText("Inbuilt2");
    },
  );
});

test.describe(() => {
  test.use({
    file: {
      exportName: "InvisibleMesh",
      path: "src/visibility.tsx",
    },
  });

  test("select visible mesh behind invisible mesh", async ({ electron }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.input("Name").locator).toHaveValue(
      "visible",
    );
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "InvisibleParent",
      path: "src/visibility.tsx",
    },
  });

  test("select visible mesh behind invisible parent", async ({ electron }) => {
    await electron.waitForScene();

    await electron.frame.click();

    await expect(electron.contextPanel.input("Name").locator).toHaveValue(
      "visible",
    );
  });
});
