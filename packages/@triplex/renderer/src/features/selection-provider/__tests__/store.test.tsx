/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSelectionStore, type SelectionStore } from "../store";

function createTestHarness() {
  const store = { current: {} };
  const renders = { current: 0 };

  function Component() {
    Object.assign(store.current, useSelectionStore());
    // eslint-disable-next-line react-compiler/react-compiler
    renders.current += 1;
    return null;
  }

  return { Component, renders, store } as never as {
    Component: () => JSX.Element;
    renders: { current: number };
    store: { current: SelectionStore };
  };
}

describe("selection store", () => {
  beforeEach(() => {
    useSelectionStore.setState({
      hovered: null,
      listeners: [],
      selections: [],
    });
  });

  it("should call all listeners", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.listen(cb1);
      store.current.listen(cb2);
    });

    store.current.listeners.forEach((cb) => cb({} as MouseEvent));

    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });

  it("should clean up listeners", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.listen(cb1)();
      store.current.listen(cb2)();
    });

    store.current.listeners.forEach((cb) => cb({} as MouseEvent));

    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });

  it("should replace selection state", () => {
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.select(
        [{ column: 1, line: 2, parentPath: "/foo", path: "/bar" }],
        "replace",
      );
      store.current.select(
        [{ column: 2, line: 4, parentPath: "/foo", path: "/bar" }],
        "replace",
      );
    });

    expect(store.current.selections).toEqual([
      { column: 2, line: 4, parentPath: "/foo", path: "/bar" },
    ]);
  });

  it("should add to selection state", () => {
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.select(
        [{ column: 1, line: 2, parentPath: "/foo", path: "/bar" }],
        "addition",
      );
      store.current.select(
        [{ column: 2, line: 4, parentPath: "/foo", path: "/bar" }],
        "addition",
      );
    });

    expect(store.current.selections).toEqual([
      { column: 1, line: 2, parentPath: "/foo", path: "/bar" },
      { column: 2, line: 4, parentPath: "/foo", path: "/bar" },
    ]);
  });

  it("should clear selections", () => {
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.select(
        [{ column: 1, line: 2, parentPath: "/foo", path: "/bar" }],
        "replace",
      );
      store.current.clear();
    });

    expect(store.current.selections).toEqual([]);
  });

  it("should update hovered state", () => {
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.setHovered({
        column: 1,
        line: 2,
        parentPath: "/foo",
        path: "/bar",
      });
    });

    expect(store.current.hovered).toEqual({
      column: 1,
      line: 2,
      parentPath: "/foo",
      path: "/bar",
    });
  });

  it("should clear hovered state when selection changes", () => {
    const { Component, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.setHovered({
        column: 1,
        line: 2,
        parentPath: "/foo",
        path: "/bar",
      });
      store.current.select(
        [{ column: 1, line: 2, parentPath: "/foo", path: "/bar" }],
        "replace",
      );
    });

    expect(store.current.hovered).toEqual(null);
  });

  it("should not re-render if hovered state is referentially the same", () => {
    const { Component, renders, store } = createTestHarness();
    render(<Component />);

    act(() => {
      store.current.setHovered(null);
    });
    act(() => {
      store.current.setHovered(null);
    });

    expect(renders.current).toEqual(1);
  });

  it("should not re-render if hovered state is structurally the same", () => {
    const { Component, renders, store } = createTestHarness();
    render(<Component />);

    const selection = () => ({
      column: 1,
      line: 2,
      parentPath: "/foo",
      path: "/bar",
    });

    act(() => {
      store.current.setHovered(selection());
    });
    act(() => {
      store.current.setHovered(selection());
    });

    expect(renders.current).toEqual(2);
  });
});
