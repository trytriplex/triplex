/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type Page } from "playwright";

export class ExtensionPage {
  constructor(public readonly page: Page) {}

  codelens(componentName: string) {
    return this.page.getByTitle(
      `Will open the ${componentName} component in Triplex`
    );
  }

  get loadedComponent() {
    const locator = this.resolvePanel()
      .locator.frameLocator("#scene")
      .getByTestId("scene-loaded-meta");

    return locator;
  }

  get editorTab() {
    const locator = this.page.getByLabel("scene.tsx, Editor Group 2");

    return {
      get closeButton() {
        return locator.getByRole("button", { name: "Close" });
      },
      locator,
    };
  }

  resolvePanel({
    filename = "scene.tsx",
    project = "test-fixture",
  }: { filename?: string; project?: string } = {}) {
    const locator = this.page
      .frameLocator(".webview.ready")
      .frameLocator(`#active-frame[title="${filename} (${project})"]`);

    return {
      get devOnlyCameraPanel() {
        return this.scene.getByTestId("camera-panel");
      },
      locator,
      get scene() {
        return locator.frameLocator("#scene");
      },
    };
  }
}
