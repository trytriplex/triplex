/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { vi } from "vitest";

globalThis.DOMRect = class DOMRect {
  bottom: number = 0;
  left: number = 0;
  right: number = 0;
  top: number = 0;
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}
  static fromRect(other?: DOMRectInit): DOMRect {
    return new DOMRect(other?.x, other?.y, other?.width, other?.height);
  }
  toJSON() {
    return JSON.stringify(this);
  }
};

vi.mock("triplex-drei", () => ({
  // Stub out Camera controls as it needs canvas capabilities that are unavailable in jsdom.
  CameraControls: () => null,
  Grid: () => null,
}));
