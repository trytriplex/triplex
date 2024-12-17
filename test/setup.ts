/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
