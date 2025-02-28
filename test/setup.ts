/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { cleanup } from "@testing-library/react";
import { clearFgOverrides, initFeatureGates } from "@triplex/lib/fg";
import { createElement, forwardRef, useState } from "react";
import { afterEach, beforeAll, vi } from "vitest";

globalThis.DOMRect = class DOMRect {
  bottom: number = 0;
  left: number = 0;
  right: number = 0;
  top: number = 0;
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0,
  ) {}
  static fromRect(other?: DOMRectInit): DOMRect {
    return new DOMRect(other?.x, other?.y, other?.width, other?.height);
  }
  toJSON() {
    return JSON.stringify(this);
  }
};

const CameraControls = forwardRef((props, ref) => {
  const [instance] = useState(() => ({ mouseButtons: {}, touches: {} }));

  return createElement("group", {
    ...props,
    name: "__stub_camera_controls__",
    ref: () => {
      if (typeof ref === "object" && ref && !ref.current) {
        ref.current = instance;
      } else if (typeof ref === "function") {
        ref(instance);
      }
    },
  });
});
CameraControls.displayName = "CameraControls";

vi.mock("triplex-drei", () => ({
  CameraControls,
  GizmoHelper: () => createElement("group", { name: "__stub_gizmo_helper__" }),
  GizmoViewcube: () =>
    createElement("mesh", { name: "__stub_gizmo_viewcube__" }),
  Grid: () => null,
  MapControls: () => createElement("mesh", { name: "__stub_map_controls__" }),
}));

vi.mock("raf-schd", () => ({ default: (fn: unknown) => fn }));

beforeAll(async () => {
  await initFeatureGates({ environment: "local", userId: "__TEST_USER__" });
});

afterEach(() => {
  clearFgOverrides();
  cleanup();
});

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (typeof window !== "undefined") {
  // @ts-expect-error
  window.triplex = {
    env: {
      ports: {
        client: 1,
        server: 2,
        ws: 3,
      },
    },
    preload: { reactThreeFiber: false },
  };
}
