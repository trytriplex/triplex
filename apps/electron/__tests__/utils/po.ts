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
    testInfo: TestInfo,
  ) {
    this.#sceneReady = scenePromise;
    this.#testInfo = testInfo;
  }

  get devOnlyCameraPanel() {
    const locator = this.page
      .frameLocator("#scene")
      .getByTestId("camera-panel");
    return locator;
  }

  get loadedComponent() {
    const locator = this.page
      .frameLocator("#scene")
      .getByTestId("scene-loaded-meta");

    return locator;
  }

  get fileDrawer() {
    const locator = this.page.getByTestId("file-drawer");

    return {
      locator,
      thumbnail(name: string) {
        const fileLocator = locator.getByRole("button", { name });
        return fileLocator;
      },
    };
  }

  get errorOverlay() {
    const locator = this.page.getByTestId("ErrorOverlay");

    return {
      locator,
    };
  }

  get openFileButton() {
    return this.page.getByLabel("Open Component...");
  }

  get fileTabs() {
    const locator = this.page.getByLabel("File tabs");

    return {
      activeTab: locator.getByTestId("active-tab"),
      locator,
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

  async switchToComponent(name: string) {
    const locator = this.page.getByTestId("component-select-input");
    await locator.selectOption(name);
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
        const inputLocator = locator.getByLabel(label, { exact: true });
        return {
          get clearButton() {
            return inputLocator.getByLabel("Clear Value");
          },
          locator: inputLocator,
        };
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
    await button.click();
    await expect
      .poll(async () => this.page.getByTestId("scene-element").count())
      .toBe(4);
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

  get stage() {
    const locator = this.page.getByTestId("stage");

    return {
      locator,
    };
  }

  get frame() {
    const locator = this.page.getByTestId("frame");

    return {
      activateButton: this.page.getByLabel("Activate Frame", { exact: true }),
      click: () => locator.click({ force: true, noWaitAfter: true }),
      collapseButton: this.page.getByLabel("Collapse To Frame"),
      deactivateButton: this.page.getByLabel("Deactivate Frame"),
      expandButton: this.page.getByLabel("Expand Frame"),
      locator,
    };
  }

  get propControls() {
    return {
      closeButton: this.page.getByLabel("Close Component Controls"),
      openButton: this.page.getByLabel("Open Component Controls"),
    };
  }

  get scenePanel() {
    const locator = this.page.getByTestId("scene-panel");

    const methods = {
      allElements: this.page.getByTestId("scene-element"),
      elementButton: (
        name: string,
        at: number = 0,
        rootLocator = this.page.getByTestId(`SceneElement(${name})`),
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
          customAction: (label: string) => locator.getByLabel(label),
          dblclick: async () => {
            await this.waitForScene();
            await locator.click({ clickCount: 2, delay: 50, force: true });
          },
          deleteButton: locator.getByTestId("delete"),
          expandButton: locator.getByTestId("expand"),
          locator,
        };
      },
      exitSelectionButton: this.page.getByLabel("Exit selection"),
      heading: locator.getByTestId("scene-panel-heading"),
      locator,
      newComponent: async () => {
        await this.waitForScene();
        const locator = this.page.getByTestId("component-select-input");
        await locator.selectOption("new-component");
        await expect
          .poll(async () => this.page.getByTestId("scene-element").count())
          .toBe(4);
      },
    };

    return methods;
  }

  get keyboard() {
    return this.page.keyboard;
  }

  get controls() {
    const locator = this.page.getByTestId("controls-menu");

    return {
      button: (label: string) => locator.getByLabel(label),
      locator,
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
            const asset = locator.getByRole("button", { exact: true, name });
            await asset.click();
          },
          openFolder: async (
            name: "built-in" | "components" | { name: string },
          ) => {
            const folder = locator.getByText(
              typeof name === "string" ? name : name.name,
              { exact: true },
            );
            await folder.click();
          },
        };
      },
    };
  }
}
