/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Page } from "playwright";

export class EditorPage {
  constructor(public readonly page: Page) {}

  async titleBar() {
    const title = this.page.getByTestId("titlebar");
    return title;
  }
}
