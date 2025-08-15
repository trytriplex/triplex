/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { act, fireEvent, renderHook } from "@testing-library/react";
import { send } from "@triplex/bridge/host";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectionProvider } from "../index";
import { useSelectionStore } from "../store";
import { useSelectionMarshal } from "../use-selection-marhsal";

vi.mock("raf-schd", () => ({ default: (fn: unknown) => fn }));

interface TestResolved {
  meta: { column: number; line: number; parentPath: string; path: string };
  node: number;
}

const stubMeta = {
  astPath: "root/mesh",
  column: 1,
  line: 1,
  parentPath: "/foo",
  path: "/bar",
};
const stubMeta1 = {
  astPath: "root/mesh.1",
  column: 2,
  line: 3,
  parentPath: "/foo",
  path: "/bar",
};

describe("selection provider", () => {
  beforeEach(() => {
    useSelectionStore.setState({
      disabled: false,
      hovered: null,
      listeners: [],
      selections: [],
    });
  });

  it("should resolve an object on hover", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseMove(document);
    });

    expect(result.current[1]).toEqual([{ meta: stubMeta, node: 0 }]);
  });

  it("should clear resolved hover on next mouse move after mouse down", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseMove(document);
      fireEvent.mouseDown(document, { clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 10, clientY: 10 });
    });

    expect(result.current[1]).toEqual([]);
  });

  it("should clear resolved hover on mouse out", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseMove(document);
      fireEvent.mouseOut(document);
    });

    expect(result.current[1]).toEqual([]);
  });

  it("should retain hover when dragging the mouse a small amount", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseMove(document);
    });

    expect(result.current[1]).toEqual([{ meta: stubMeta, node: 0 }]);
  });

  it("should remove hover when dragging the mouse a lot", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseDown(document, { clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
    });

    expect(result.current[1]).toEqual([]);
  });

  it("should select an object", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
    });

    expect(result.current[0]).toEqual([{ meta: stubMeta, node: 0 }]);
  });

  it("should clear an object", () => {
    const mockListener = vi.fn();
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: mockListener,
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );
    act(() => {
      mockListener.mockReturnValueOnce([stubMeta]);
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
    });

    act(() => {
      mockListener.mockReturnValueOnce([]);
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
    });

    expect(result.current[0]).toEqual([]);
  });

  it("should cycle through selections", () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta, stubMeta1];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );

    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
    });
    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document, { detail: 2 });
    });

    expect(result.current[0]).toEqual([{ meta: stubMeta1, node: 0 }]);
  });

  it("should clear resolved selections when moving to play state", async () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );
    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
      fireEvent.mouseMove(document);
    });

    await act(async () => {
      await send("request-state-change", { camera: "default", state: "play" });
    });

    expect(result.current[0]).toHaveLength(0);
    expect(result.current[1]).toHaveLength(0);
  });

  it("should persist selections when coming back to edit state", async () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );
    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
    });
    await act(async () => {
      await send("request-state-change", { camera: "default", state: "play" });
    });

    await act(async () => {
      await send("request-state-change", { camera: "default", state: "edit" });
    });

    expect(result.current[0]).toEqual([{ meta: stubMeta, node: 0 }]);
  });

  it("should prevent new selections when in play state", async () => {
    const { result } = renderHook(
      () =>
        useSelectionMarshal<TestResolved>({
          listener: () => {
            return [stubMeta];
          },
          resolve: (selected) => {
            return selected.map((meta, index) => ({
              meta,
              node: index,
            }));
          },
        }),
      { wrapper: SelectionProvider },
    );
    await act(async () => {
      await send("request-state-change", { camera: "default", state: "play" });
    });
    act(() => {
      fireEvent.mouseDown(document);
      fireEvent.mouseUp(document);
      fireEvent.mouseMove(document);
    });

    await act(async () => {
      await send("request-state-change", { camera: "default", state: "edit" });
    });

    expect(result.current[0]).toHaveLength(0);
    expect(result.current[1]).toHaveLength(0);
  });
});
