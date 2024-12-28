/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { act, fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectionProvider } from "..";
import { useSelectionMarshal } from "../use-selection-marhsal";

interface TestResolved {
  meta: { column: number; line: number; parentPath: string; path: string };
  node: number;
}

const stubMeta = { column: 1, line: 1, parentPath: "/foo", path: "/bar" };
const stubMeta1 = { column: 2, line: 3, parentPath: "/foo", path: "/bar" };

describe("selection provider", () => {
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

    expect(result.current[1]).toEqual({ meta: stubMeta, node: 0 });
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
      fireEvent.mouseDown(document);
      fireEvent.mouseMove(document);
    });

    expect(result.current[1]).toEqual(null);
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

    expect(result.current[1]).toEqual(null);
  });

  it("should prevent hover when dragging", () => {
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

    expect(result.current[1]).toBe(null);
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
});
