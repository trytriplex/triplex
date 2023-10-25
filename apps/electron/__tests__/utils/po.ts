/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Page } from "playwright";

export class EditorPage {
  constructor(public readonly page: Page) {}

  titleBar() {
    const title = this.page.getByTestId("titlebar");
    return title;
  }

  async screenshot() {
    return this.page.screenshot();
  }

  async newFile() {
    const button = this.page.getByTestId("new-file");
    return button.click();
  }

  sceneElementButton(scope: { column: number; line: number; name: string }) {
    return this.page.getByTestId(
      `${scope.name}-L${scope.line}C${scope.column}`
    );
  }

  async openAssetsDrawer(scope?: {
    column: number;
    line: number;
    name: string;
  }) {
    const buttonTestId = scope
      ? `add-${scope.name}-L${scope.line}C${scope.column}`
      : "open-assets-drawer";
    const openButton = this.page.getByTestId(buttonTestId);
    await openButton.click();

    const drawer = this.page.getByTestId("assets-drawer");

    return {
      addAsset: async (name: string) => {
        const asset = drawer.getByText(name, { exact: true });
        await asset.click();
      },
      openFolder: async (name: "built-in" | "components" | "assets") => {
        const locator = drawer.getByText(name, { exact: true });
        await locator.click();
      },
    };
  }
}
