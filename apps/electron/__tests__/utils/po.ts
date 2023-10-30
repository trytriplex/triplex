/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect, TestInfo } from "@playwright/test";
import { Page } from "playwright";

export class EditorPage {
  #sceneReady: Promise<void>;
  #testInfo: TestInfo;

  constructor(
    public readonly page: Page,
    scenePromise: Promise<void>,
    testInfo: TestInfo
  ) {
    this.#sceneReady = scenePromise;
    this.#testInfo = testInfo;
  }

  get titleBar() {
    const title = this.page.getByTestId("titlebar");
    return title;
  }

  get contextPanel() {
    const locator = this.page.getByTestId("context-panel");

    return {
      heading: locator.getByTestId("context-panel-heading"),
      input(label: string) {
        return locator.getByLabel(label);
      },
      locator,
    };
  }

  async screenshot() {
    return this.page.screenshot();
  }

  async waitForScene() {
    // Ensuring the scene is available can be slow. Mark the test as such.
    this.#testInfo.slow();
    return this.#sceneReady;
  }

  async newFile() {
    await this.waitForScene();
    const button = this.page.getByTestId("new-file");
    await button.click();
    await expect
      .poll(async () => this.page.getByTestId("scene-element").count())
      .toBe(0);
  }

  get scenePanel() {
    const locator = this.page.getByTestId("scene-panel");

    return {
      allElements: this.page.getByTestId("scene-element"),
      elementButton: (name: string) => {
        const locator = this.page.getByRole("button", { name });

        return {
          addButton: locator.getByTestId("add"),
          click: async () => {
            await this.waitForScene();
            await locator.click({ force: true });
          },
          dblclick: async () => {
            await this.waitForScene();
            await locator.click({ clickCount: 2, delay: 50, force: true });
          },
          deleteButton: locator.getByTestId("delete"),
          enterCameraButton: locator.getByTestId("enter-camera"),
          expandButton: locator.getByTestId("expand"),
          focusButton: locator.getByTestId("jump-to"),
          locator,
        };
      },
      exitSelectionButton: this.page.getByLabel("Exit selection"),
      heading: locator.getByTestId("scene-panel-heading"),
      locator,
      newComponent: async () => {
        this.waitForScene();
        const locator = this.page.getByTestId("component-select-input");
        await locator.click();
        await locator.selectOption("new-component");
        await expect
          .poll(async () => this.page.getByTestId("scene-element").count())
          .toBe(0);
      },
      unsavedIndicator: locator.getByLabel("Unsaved changes"),
    };
  }

  get controlsMenu() {
    const locator = this.page.getByTestId("controls-menu");

    return {
      exitUserCameraButton: locator.getByTestId("user-camera"),
      locator,
    };
  }

  get keyboard() {
    return this.page.keyboard;
  }

  get assetsDrawer() {
    const locator = this.page.getByTestId("assets-drawer");

    return {
      open: async (name?: string) => {
        if (name) {
          const { addButton } = this.scenePanel.elementButton(name);
          await addButton.click();
        } else {
          const openButton = this.page.getByTestId("open-assets-drawer");
          await openButton.click();
        }

        return {
          addAsset: async (name: string) => {
            const asset = locator.getByText(name, { exact: true });
            await asset.click();
          },
          openFolder: async (
            name: "built-in" | "components" | { name: string }
          ) => {
            const folder = locator.getByText(
              typeof name === "string" ? name : name.name,
              { exact: true }
            );
            await folder.click();
          },
        };
      },
    };
  }
}
