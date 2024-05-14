/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import {
  default as CCIMPL,
  type default as CameraControlsImpl,
} from "camera-controls";
import { render } from "react-three-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Camera, useCamera } from "../camera";

const defaultModifiers = {
  left: CCIMPL.ACTION.ROTATE,
  middle: CCIMPL.ACTION.DOLLY,
  right: CCIMPL.ACTION.TRUCK,
};

const setVisibility = (state: "hidden" | "visible") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get() {
      return state;
    },
  });
};

vi.useFakeTimers({ loopLimit: 10 });

const setDocumentFocus = (hasFocus: boolean) => {
  Object.defineProperty(document, "hasFocus", {
    configurable: true,
    value: () => hasFocus,
  });
};

describe("camera", () => {
  beforeEach(() => {
    setDocumentFocus(true);
  });

  it("should default to rest modifiers", async () => {
    const controlsRef: React.MutableRefObject<CameraControlsImpl | null> = {
      current: null,
    };
    function HoistControls() {
      const { controls } = useCamera();
      controlsRef.current = controls.current;
      return null;
    }

    await render(
      <Camera>
        <HoistControls />
      </Camera>
    );

    expect(controlsRef.current).toEqual({
      mouseButtons: defaultModifiers,
      touches: {},
    });
  });

  it("should should apply truck modifier when pressing shift", async () => {
    const controlsRef: React.MutableRefObject<CameraControlsImpl | null> = {
      current: null,
    };
    function HoistControls() {
      const { controls } = useCamera();
      controlsRef.current = controls.current;
      return null;
    }
    const { act, fireDOMEvent } = await render(
      <Camera>
        <HoistControls />
      </Camera>
    );

    await act(() => fireDOMEvent.keyDown(document, { key: "Shift" }));

    expect(controlsRef.current?.mouseButtons.left).toEqual(CCIMPL.ACTION.TRUCK);
  });

  it("should reset modifiers when releasing shift", async () => {
    const controlsRef: React.MutableRefObject<CameraControlsImpl | null> = {
      current: null,
    };
    function HoistControls() {
      const { controls } = useCamera();
      controlsRef.current = controls.current;
      return null;
    }
    const { act, fireDOMEvent } = await render(
      <Camera>
        <HoistControls />
      </Camera>
    );
    await act(() => fireDOMEvent.keyDown(document, { key: "Shift" }));

    await act(() => {
      setVisibility("hidden");
      fireDOMEvent(document, new Event("visibilitychange"));
      setVisibility("visible");
    });

    expect(controlsRef.current).toEqual({
      mouseButtons: defaultModifiers,
      touches: {},
    });
  });

  it("should reset modifiers when document frame loses focus", async () => {
    const controlsRef: React.MutableRefObject<CameraControlsImpl | null> = {
      current: null,
    };
    function HoistControls() {
      const { controls } = useCamera();
      controlsRef.current = controls.current;
      return null;
    }
    const { act, fireDOMEvent } = await render(
      <Camera>
        <HoistControls />
      </Camera>
    );
    await act(() => fireDOMEvent.keyDown(document, { key: "Shift" }));

    await act(() => {
      setDocumentFocus(false);
      vi.runAllTimers();
    });

    expect(controlsRef.current).toEqual({
      mouseButtons: defaultModifiers,
      touches: {},
    });
  });
});
