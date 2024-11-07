/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent } from "@testing-library/dom";
import { describe, expect, it, vi } from "vitest";
import { createKeyboardEventForwarder } from "../keyboard";

describe("keyboard bridge", () => {
  it("should forward event data", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const fn = vi.fn();
    createKeyboardEventForwarder(fn);

    fireEvent.keyDown(element, { key: "Shift" });

    expect(fn.mock.calls[0]).toMatchInlineSnapshot(`
      [
        "keydown",
        {
          "altKey": false,
          "code": "",
          "ctrlKey": false,
          "isComposing": false,
          "key": "Shift",
          "keyCode": 0,
          "location": 0,
          "metaKey": false,
          "repeat": false,
          "shiftKey": false,
        },
      ]
    `);
  });

  it("should forward real events", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const fn = vi.fn();
    createKeyboardEventForwarder(fn);

    fireEvent.keyDown(element, { key: "Shift" });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should skip forwarding synthetic events", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const fn = vi.fn();
    createKeyboardEventForwarder(fn);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift" }));

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
