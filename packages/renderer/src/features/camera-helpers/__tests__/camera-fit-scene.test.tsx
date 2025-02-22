/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom

import { type default as CameraControls } from "camera-controls";
import { render } from "react-three-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CameraControlsContext } from "../../camera-new/context";
import { FitCameraToScene } from "../camera-fit-scene";

const fitToSphere = vi.fn();
const rotateTo = vi.fn();

describe("camera fit to scene", () => {
  const stubControls = { fitToSphere, rotateTo } as never as CameraControls;

  beforeEach(() => {
    fitToSphere.mockClear();
    rotateTo.mockClear();
  });

  it("should skip fitting if the scene is empty", async () => {
    await render(
      <CameraControlsContext value={stubControls}>
        <FitCameraToScene resetKeys={["1"]} />
        <mesh />
      </CameraControlsContext>,
    );

    expect(fitToSphere).not.toHaveBeenCalled();
    expect(rotateTo).not.toHaveBeenCalled();
  });

  it("should fit camera to the scene", async () => {
    await render(
      <CameraControlsContext value={stubControls}>
        <FitCameraToScene resetKeys={["2"]} />
        <mesh>
          <boxGeometry />
        </mesh>
      </CameraControlsContext>,
    );

    expect(fitToSphere).toHaveBeenCalled();
    expect(rotateTo).toHaveBeenCalled();
  });
});
