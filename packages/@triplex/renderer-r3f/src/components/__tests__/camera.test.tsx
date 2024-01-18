/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { send } from "@triplex/bridge/host";
import { render } from "react-three-test";
import { PerspectiveCamera } from "triplex-drei";
import { describe, expect, it } from "vitest";
import { SceneObject } from "../../scene-object";
import { Camera } from "../camera";

describe("camera", () => {
  it("should default to perspective camera", async () => {
    const { scene } = await render(
      <Camera position={[0, 0, 0]} target={[0, 0, 0]} />
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls: any = scene.find(
      (node) => node.instance.constructor.name === "OrbitControls"
    );

    expect(controls.instance.object.type).toEqual("PerspectiveCamera");
  });

  it("should enable the controls when a user land camera is inactive", async () => {
    const { scene } = await render(
      <Camera position={[0, 0, 0]} target={[0, 0, 0]} />
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls: any = scene.find(
      (node) => node.instance.constructor.name === "OrbitControls"
    );

    expect(controls.instance.enabled).toEqual(true);
  });

  it("should disable the controls when a user land camera is active", async () => {
    const { act, scene } = await render(
      <Camera position={[0, 0, 0]} target={[0, 0, 0]}>
        <SceneObject
          __component={PerspectiveCamera}
          __meta={{ column: 111, line: 33, name: "p", path: "path" }}
          name="foo"
        />
      </Camera>
    );

    await act(() =>
      send(
        "element-action-triggered",
        {
          data: {
            column: 111,
            line: 33,
            parentPath: "path",
          },
          id: "enter-camera",
        },
        true
      )
    );

    const controls = scene.findAll(
      (node) => node.instance.constructor.name === "OrbitControls"
    );
    expect(controls.length).toEqual(0);
  });
});
