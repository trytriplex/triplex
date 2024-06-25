/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "../utils/runner";

test("select custom component", async ({ editorR3F }) => {
  await editorR3F.waitForScene();

  await editorR3F.frame.click();

  await expect(editorR3F.contextPanel.heading).toHaveText("Box");
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Camera",
      path: "src/zcamera.tsx",
    },
  });

  test("select camera component", async ({ editorR3F }) => {
    await editorR3F.waitForScene();

    await editorR3F.frame.click();

    await expect(editorR3F.contextPanel.heading).toHaveText(
      "PerspectiveCamera",
    );
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "default",
      path: "src/geometry/box.tsx",
    },
  });

  test("select host element mesh", async ({ editorR3F }) => {
    await editorR3F.waitForScene();

    await editorR3F.frame.click();

    await expect(editorR3F.contextPanel.heading).toHaveText("mesh");
  });
});

test.describe(() => {
  test.use({
    file: {
      exportName: "Light",
      path: "src/geometry/light.tsx",
    },
  });

  test("select host element light", async ({ editorR3F }) => {
    await editorR3F.waitForScene();

    await editorR3F.frame.click();

    await expect(editorR3F.contextPanel.heading).toHaveText("ambientLight");
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
    editorR3F,
  }) => {
    await editorR3F.waitForScene();

    await editorR3F.frame.click();

    await expect(editorR3F.contextPanel.heading).toHaveText("Container");
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
    editorR3F,
  }) => {
    await editorR3F.waitForScene();

    await editorR3F.frame.click();

    await expect(editorR3F.contextPanel.heading).toHaveText("Inbuilt2");
  });
});
