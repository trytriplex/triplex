/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test("select custom component", async ({ electron }) => {
  await electron.frame.click();

  await expect(electron.contextPanel.heading).toHaveText("Box");
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Camera",
      path: "src/cameras.tsx",
    },
  });

  test("select camera component", async ({ electron }) => {
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

  test(
    "select host element mesh",
    { tag: "@electron_smoke" },
    async ({ electron }) => {
      await electron.frame.click();

      await expect(electron.contextPanel.heading).toHaveText("mesh");
    },
  );
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Light",
      path: "src/geometry/light.tsx",
    },
  });

  test("select host element light", async ({ electron }) => {
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

  test("select component in scene of deeply nested component", async ({
    electron,
  }) => {
    await electron.frame.click();

    await expect(electron.contextPanel.heading).toHaveText("Inbuilt2");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "InvisibleMesh",
      path: "src/visibility.tsx",
    },
  });

  test("select visible mesh behind invisible mesh", async ({ electron }) => {
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
    await electron.frame.click();

    await expect(electron.contextPanel.input("Name").locator).toHaveValue(
      "visible",
    );
  });
});
