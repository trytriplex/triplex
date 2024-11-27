/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect } from "@playwright/test";
import { type Page } from "playwright";

export class ExtensionPage {
  constructor(
    public readonly page: Page,
    public readonly filename: string,
    public readonly project: string,
  ) {}

  codelens(
    componentName: string,
    {
      skipWait = false,
    }: {
      /**
       * Resolves immediately after clicking instead of waiting for the
       * component to fully load.
       */
      skipWait?: boolean;
    } = {},
  ) {
    const locator = this.page.getByTitle(
      `Will open the ${componentName} component in Triplex`,
    );

    return {
      click: async () => {
        await locator.click();
        if (!skipWait) {
          await expect(this.loadedComponent).toHaveText(componentName);
        }
      },
    };
  }

  get loadedComponent() {
    const locator = this.resolveEditor()
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

  dismissAllNotifications() {
    return this.page
      .getByLabel("Clear Notification")
      .all()
      .then((buttons) => {
        return Promise.all(buttons.map((button) => button.click()));
      });
  }

  resolveEditor() {
    const that = this;
    const locator = this.page
      .frameLocator(".webview.ready")
      .frameLocator(
        `#active-frame[title="${this.filename} (${this.project})"]`,
      );

    return {
      get componentControlsButtons() {
        return {
          close: locator.getByRole("button", {
            name: "Close Component Controls",
          }),
          open: locator.getByRole("button", {
            name: "Open Component Controls",
          }),
        };
      },
      get devOnlyCameraPanel() {
        return this.scene.locator.getByTestId("camera-panel");
      },
      locator,
      get panels() {
        return locator.getByTestId("panels");
      },
      get scene() {
        const frameLocator = locator.frameLocator("#scene");
        return {
          async click() {
            await that.dismissAllNotifications();
            return locator.getByTestId("scene").click({ force: true });
          },
          locator: frameLocator,
        };
      },
      get togglePanelsButton() {
        return locator.getByRole("button", { name: "View Scene Elements" });
      },
    };
  }
}
