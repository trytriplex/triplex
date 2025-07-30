/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { fireEvent } from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createKeyboardEventForwarder } from "../keyboard";

describe("keyboard bridge", () => {
  beforeEach(() => {
    window.triplex.env.state = "edit";
  });

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

  it("should skip forwarding events when predicate returns false", () => {
    const element = document.createElement("div");
    document.body.append(element);
    const fn = vi.fn();
    createKeyboardEventForwarder(fn, { predicate: () => false });

    fireEvent.keyDown(element, { key: "Shift" });

    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("should skip forwarding events when target / current target are the same", () => {
    const fn = vi.fn();
    createKeyboardEventForwarder(fn);

    fireEvent.keyDown(window, { key: "Shift" });

    expect(fn).toHaveBeenCalledTimes(0);
  });
});
