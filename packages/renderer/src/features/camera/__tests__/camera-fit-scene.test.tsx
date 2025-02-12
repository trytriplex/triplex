/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
