/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { test } from "./utils/runner";

test.describe("when an error is thrown on render", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-on-render.tsx",
  });

  test("should show an error notification and then recover", async ({
    setSnapshot,
    vsce,
  }) => {
    await vsce.codelens("ErrorsDuringRender", { skipWait: true }).click();
    const notifications = vsce.page.getByRole("dialog", {
      name: "source: Triplex for VS Code, notification",
    });

    // Error should not bubble up to the unhandled listener as we have logic to ignore it.
    await expect(notifications).toHaveCount(1);
    await expect(notifications).toHaveText(
      "Render Error: Throwing an error on render.",
    );

    await setSnapshot((file) => {
      const index = file.indexOf("throwsError(");
      return file.slice(0, index) + "// " + file.slice(index);
    });

    await expect(vsce.loadedComponent).toHaveText("ErrorsDuringRender");
  });
});

test.describe("when an error is thrown on missing module", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-missing-dependency.tsx",
  });

  test("should show an error notification and then recover", async ({
    setSnapshot,
    vsce,
  }) => {
    await vsce
      .codelens("ErrorsDuringDependencyResolution", { skipWait: true })
      .click();
    const notifications = vsce.page.getByRole("dialog", {
      name: "source: Triplex for VS Code, notification",
    });

    // Error should not bubble up to the unhandled listener as we have logic to ignore it.
    await expect(notifications).toHaveCount(2);
    await expect(notifications.nth(0)).toHaveText(
      /Module Error: Failed to fetch/,
    );
    await expect(notifications.nth(1)).toHaveText(
      /Module Error: Failed to resolve/,
    );

    await setSnapshot((file) => {
      const index = file.indexOf(`import "dont-`);
      return file.slice(0, index) + "// " + file.slice(index);
    });

    await expect(vsce.loadedComponent).toHaveText(
      "ErrorsDuringDependencyResolution",
    );
  });
});

test.describe("when an error is thrown during module initialization", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-module-scope.tsx",
  });

  test("should show an error notification", async ({ vsce }) => {
    await vsce.codelens("ErrorsDuringModuleInit", { skipWait: true }).click();

    const notifications = vsce.page.getByRole("dialog", {
      name: "source: Triplex for VS Code, notification",
    });

    // Error should not bubble up to the unhandled listener as we have logic to ignore it.
    await expect(notifications).toHaveCount(1);
    await expect(notifications).toHaveText(
      `Module Error: Throwing an error during module initialization.`,
    );
  });
});

test.describe("when an error is thrown on interaction", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-on-interaction.tsx",
  });

  test("should show an error notification", async ({ vsce }) => {
    await vsce.codelens("ErrorsDuringInteraction").click();
    const { locator } = await vsce.resolveEditor();
    await locator.getByRole("button", { exact: true, name: "Play" }).click();

    await locator.getByTestId("scene").click({ force: true });

    await expect(
      vsce.page.getByRole("dialog", {
        name: "source: Triplex for VS Code, notification",
      }),
    ).toHaveText("Unhandled Error: Throwing an error on interaction.");
  });
});

test.describe("when an error is thrown during glsl compilation", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-glsl.tsx",
  });

  test("should show a notification for both vertex and fragment failures", async ({
    vsce,
  }) => {
    await vsce.codelens("GLSLErrorAll").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: "source: Triplex for VS Code, notification",
      }),
    ).toHaveText(/GLSL Error: Vertex and fragment shaders failed to compile/);
  });

  test("should show a notification for vertex failure", async ({ vsce }) => {
    await vsce.codelens("GLSLErrorVertex").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: "source: Triplex for VS Code, notification",
      }),
    ).toHaveText(
      /GLSL Error: A vertex shader failed to compile because of the error/,
    );
  });

  test("should show a notification for fragment failure", async ({ vsce }) => {
    await vsce.codelens("GLSLErrorFragment").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: "source: Triplex for VS Code, notification",
      }),
    ).toHaveText(
      /GLSL Error: A fragment shader failed to compile because of the error/,
    );
  });
});

test.describe("when an error is thrown during glsl compilation (2)", () => {
  test.use({
    filename: "examples/test-fixture/src/throws-error-glsl-fallback.tsx",
  });

  test("should show a notification for varying failure", async ({ vsce }) => {
    await vsce.codelens("GLSLErrorFallback").click();

    await expect(
      vsce.page.getByRole("dialog", {
        name: "source: Triplex for VS Code, notification",
      }),
    ).toHaveText(
      /GLSL Error: A shader failed to compile because of the error "FRAGMENT varying/,
    );
  });
});

test.describe("when an error is thrown resolving a renderer", () => {
  test.use({
    filename: "examples-private/error-renderer/src/examples/scene.tsx",
  });

  test("should show unrecoverable splash screen", async ({ vsce }) => {
    await vsce.codelens("Component", { skipWait: true }).click();
    const { locator } = vsce.resolveEditor();

    await expect(locator.getByTestId("ErrorSplash")).toHaveText(
      /An Unexpected Error Occurred/,
    );
  });
});
