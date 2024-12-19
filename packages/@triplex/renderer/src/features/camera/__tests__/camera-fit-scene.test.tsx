/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom

import { render } from "react-three-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FitCameraToScene } from "../camera-fit-scene";

const fitToSphere = vi.fn();
const rotateTo = vi.fn();

vi.mock("../context", () => ({
  useCamera: () => ({
    controls: { fitToSphere, rotateTo },
  }),
}));

describe("camera fit to scene", () => {
  beforeEach(() => {
    fitToSphere.mockClear();
    rotateTo.mockClear();
  });

  it("should skip fitting if the scene is empty", async () => {
    await render(
      <>
        <FitCameraToScene resetKeys={["1"]} />
        <mesh />
      </>,
    );

    expect(fitToSphere).not.toHaveBeenCalled();
    expect(rotateTo).not.toHaveBeenCalled();
  });

  it("should fit camera to the scene", async () => {
    await render(
      <>
        <FitCameraToScene resetKeys={["2"]} />
        <mesh>
          <boxGeometry />
        </mesh>
      </>,
    );

    expect(fitToSphere).toHaveBeenCalled();
    expect(rotateTo).toHaveBeenCalled();
  });
});
