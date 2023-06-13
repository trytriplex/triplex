// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "react-three-test";
import { PerspectiveCamera } from "triplex-drei";
import { Camera } from "../camera";

describe("camera", () => {
  it("should default to perspective camera", async () => {
    const { scene } = await render(
      <Camera position={[0, 0, 0]} target={[0, 0, 0]} />
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = scene.allChildren.at(-1) as any;

    expect(controls.instance.object.type).toEqual("PerspectiveCamera");
  });

  it("should enable the controls when a user land camera is inactive", async () => {
    const { scene } = await render(
      <Camera position={[0, 0, 0]} target={[0, 0, 0]} />
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = scene.allChildren.at(-1) as any;

    expect(controls.instance.enabled).toEqual(true);
  });

  it("should disable the controls when a user land camera is active", async () => {
    const { scene } = await render(
      <>
        <Camera position={[0, 0, 0]} target={[0, 0, 0]} />
        <PerspectiveCamera makeDefault />
      </>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = scene.allChildren.at(-1) as any;

    expect(controls.instance.enabled).toEqual(false);
  });
});
