/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { cleanup } from "@testing-library/react";
import { clearFgOverrides, initFeatureGates } from "@triplex/lib/fg";
import { dirname } from "@triplex/lib/path";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { handlers } from "./__mocks__/wss";
import { findNearestPackageJSON } from "./package";

const server = setupServer(...handlers);

beforeAll(({ file }) => {
  const found = findNearestPackageJSON(dirname(file.filepath));
  if (found) {
    process.chdir(found);
  }
});

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
});

afterAll(() => server.close());

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

if (typeof window !== "undefined") {
  window.triplex = {
    // @ts-expect-error
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
