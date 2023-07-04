/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "react-three-test";
import { PerspectiveCamera } from "triplex-drei";
import { Camera, useCamera } from "../camera";
import { useEffect, useRef } from "react";

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
    function ForceCamera() {
      const ref = useRef<THREE.PerspectiveCamera>();
      const { setCamera } = useCamera();
      useEffect(() => {
        setCamera(ref.current!, { column: -1, line: -1, path: "" });
      }, [setCamera]);

      return <PerspectiveCamera ref={ref} makeDefault />;
    }
    const { scene } = await render(
      <>
        <Camera position={[0, 0, 0]} target={[0, 0, 0]}>
          <ForceCamera />
        </Camera>
      </>
    );

    const controls = scene.findAll(
      (node) => node.instance.constructor.name === "OrbitControls"
    );

    expect(controls.length).toEqual(0);
  });
});
