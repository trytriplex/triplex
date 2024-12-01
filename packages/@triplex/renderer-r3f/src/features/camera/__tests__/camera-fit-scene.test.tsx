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
    controls: { current: { fitToSphere, rotateTo } },
  }),
}));

describe("camera fit to scene", () => {
  beforeEach(() => {
    fitToSphere.mockClear();
    rotateTo.mockClear();
  });

  it("should skip fitting if the scene is empty", async () => {
    await render(
      <FitCameraToScene resetKeys={["1"]}>
        <mesh />
      </FitCameraToScene>,
    );

    expect(fitToSphere).not.toHaveBeenCalled();
    expect(rotateTo).not.toHaveBeenCalled();
  });

  it("should fit camera to the scene", async () => {
    await render(
      <FitCameraToScene resetKeys={["2"]}>
        <mesh>
          <boxGeometry />
        </mesh>
      </FitCameraToScene>,
    );

    expect(fitToSphere).toHaveBeenCalled();
    expect(rotateTo).toHaveBeenCalled();
  });

  it("should skip fitting if the reset key is the same as the previously committed one", async () => {
    const { update } = await render(
      <FitCameraToScene resetKeys={["3"]}>
        <mesh>
          <boxGeometry />
        </mesh>
      </FitCameraToScene>,
    );

    await update(
      <FitCameraToScene resetKeys={["3"]}>
        <mesh>
          <boxGeometry />
        </mesh>
      </FitCameraToScene>,
    );

    expect(fitToSphere).toHaveBeenCalledOnce();
    expect(rotateTo).toHaveBeenCalledOnce();
  });

  it("should skip fitting if the reset key is the same as the previously committed one even if remounting", async () => {
    const { update } = await render(
      <FitCameraToScene resetKeys={["4"]}>
        <mesh>
          <boxGeometry />
        </mesh>
      </FitCameraToScene>,
    );

    await update(
      <FitCameraToScene key="reset" resetKeys={["4"]}>
        <mesh>
          <boxGeometry />
        </mesh>
      </FitCameraToScene>,
    );

    expect(fitToSphere).toHaveBeenCalledOnce();
    expect(rotateTo).toHaveBeenCalledOnce();
  });
});
