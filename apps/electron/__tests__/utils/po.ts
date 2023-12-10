/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { expect, type TestInfo } from "@playwright/test";
import { type Page } from "playwright";

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

  get fileDrawer() {
    const locator = this.page.getByTestId("file-drawer");

    return {
      fileLink(name: string) {
        const fileLocator = locator.getByRole("link", { name });
        return fileLocator;
      },
      locator,
    };
  }

  get errorOverlay() {
    const locator = this.page.getByTestId("ErrorOverlay");

    return {
      locator,
    };
  }

  get fileTabs() {
    const locator = this.page.getByLabel("File tabs");

    return {
      activeTab: locator.getByTestId("active-tab"),
      locator,
      openFileButton: locator.getByLabel("Open Component..."),
      openLastTabButton: locator.getByLabel("Open Last Tab"),
      tab(name: string) {
        const tabLocator = locator.getByRole("button", { name }).first();

        return {
          closeButton: tabLocator.getByLabel(`Close ${name}`),
          locator: tabLocator,
          unsavedIndicator: tabLocator.getByLabel("Unsaved changes"),
        };
      },
      waitForActiveTab: async (text: string) => {
        this.#testInfo.slow();
        await expect(locator.getByTestId("active-tab")).toHaveText(text);
      },
    };
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
      waitForInputValue(type: "number" | "string" | "boolean", value: string) {
        return locator.getByTestId(`${type}-${value}`).waitFor();
      },
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
    const button = this.page.getByLabel("New file");
    await button.dblclick();
    await expect
      .poll(async () => this.page.getByTestId("scene-element").count())
      .toBe(3);
  }

  waitForElementCount(count: number) {
    return expect
      .poll(async () => this.page.getByTestId("scene-element").count())
      .toBe(count);
  }

  undo() {
    const locator = this.page.getByLabel("Undo");
    return locator.click();
  }

  redo() {
    const locator = this.page.getByLabel("Redo");
    return locator.click();
  }

  get scenePanel() {
    const locator = this.page.getByTestId("scene-panel");

    const methods = {
      allElements: this.page.getByTestId("scene-element"),
      elementButton: (
        name: string,
        at: number = 0,
        rootLocator = this.page.getByTestId(`SceneElement(${name})`)
      ) => {
        const locator = rootLocator.getByRole("button", { name }).nth(at);

        return {
          addButton: locator.getByTestId("add"),
          childElementButton: (name: string, at: number = 0) => {
            return methods.elementButton(name, at, rootLocator);
          },
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
          exitCameraButton: locator.getByTestId("exit-camera"),
          expandButton: locator.getByTestId("expand"),
          focusButton: locator.getByTestId("jump-to"),
          locator,
        };
      },
      exitSelectionButton: this.page.getByLabel("Exit selection"),
      heading: locator.getByTestId("scene-panel-heading"),
      locator,
      newComponent: async () => {
        await this.waitForScene();
        const locator = this.page.getByTestId("component-select-input");
        await locator.click();
        await locator.selectOption("new-component");
        await expect
          .poll(async () => this.page.getByTestId("scene-element").count())
          .toBe(3);
      },
    };

    return methods;
  }

  get keyboard() {
    return this.page.keyboard;
  }

  get camera() {
    return {
      toOrthographicButton: this.page.getByTestId("orthographic"),
      toPerspectiveButton: this.page.getByTestId("perspective"),
    };
  }

  get assetsDrawer() {
    const locator = this.page.getByTestId("assets-drawer");

    return {
      open: async (name: string = "", at: number = 0) => {
        if (name) {
          const { addButton } = this.scenePanel.elementButton(name, at);
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
