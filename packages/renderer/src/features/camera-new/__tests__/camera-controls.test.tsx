/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { default as CameraControlsInstance } from "camera-controls";
import { useContext } from "react";
import { render } from "react-three-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CameraControlsContext, DefaultCameraContext } from "../context";
import { Camera } from "../index";

const defaultModifiers = {
  left: CameraControlsInstance.ACTION.ROTATE,
  middle: CameraControlsInstance.ACTION.DOLLY,
  right: CameraControlsInstance.ACTION.TRUCK,
};

const setVisibility = (state: "hidden" | "visible") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get() {
      return state;
    },
  });
};

const setDocumentFocus = (hasFocus: boolean) => {
  Object.defineProperty(document, "hasFocus", {
    configurable: true,
    value: () => hasFocus,
  });
};

describe("camera", () => {
  beforeEach(() => {
    vi.useFakeTimers({ loopLimit: 10 });
    setDocumentFocus(true);
  });

  it("should default to rest modifiers", async () => {
    let controlsRef: CameraControlsInstance | null = null;
    function HoistControls() {
      const controls = useContext(CameraControlsContext);
      // eslint-disable-next-line react-compiler/react-compiler
      controlsRef = controls;
      return null;
    }

    await render(
      <Camera>
        <HoistControls />
      </Camera>,
    );

    expect(controlsRef).toEqual({
      mouseButtons: defaultModifiers,
      touches: {},
    });
  });

  it("should unmount controls when userland", async () => {
    let controlsRef: CameraControlsInstance | null = null;
    function HoistControls() {
      const controls = useContext(CameraControlsContext);
      // eslint-disable-next-line react-compiler/react-compiler
      controlsRef = controls;
      return null;
    }

    await render(
      <DefaultCameraContext.Provider value="default">
        <Camera>
          <HoistControls />
        </Camera>
      </DefaultCameraContext.Provider>,
    );

    expect(controlsRef).toEqual(null);
  });

  it("should should apply truck modifier when pressing shift", async () => {
    let controlsRef: CameraControlsInstance | null = null;
    function HoistControls() {
      const controls = useContext(CameraControlsContext);
      // eslint-disable-next-line react-compiler/react-compiler
      controlsRef = controls;
      return null;
    }
    const { act, fireDOMEvent } = await render(
      <Camera>
        <HoistControls />
      </Camera>,
    );

    await act(() => fireDOMEvent.keyDown(window, { key: "Shift" }));

    expect(controlsRef).toEqual({
      mouseButtons: {
        ...defaultModifiers,
        left: CameraControlsInstance.ACTION.TRUCK,
      },
      touches: {},
    });
  });

  it("should reset modifiers when releasing shift", async () => {
    let controlsRef: CameraControlsInstance | null = null;
    function HoistControls() {
      const controls = useContext(CameraControlsContext);
      // eslint-disable-next-line react-compiler/react-compiler
      controlsRef = controls;
      return null;
    }
    const { act, fireDOMEvent } = await render(
      <Camera>
        <HoistControls />
      </Camera>,
    );
    await act(() => fireDOMEvent.keyDown(window, { key: "Shift" }));

    await act(() => {
      setVisibility("hidden");
      fireDOMEvent(window, new Event("visibilitychange"));
      setVisibility("visible");
    });

    expect(controlsRef).toEqual({
      mouseButtons: defaultModifiers,
      touches: {},
    });
  });

  it("should reset modifiers when document frame loses focus", async () => {
    let controlsRef: CameraControlsInstance | null = null;
    function HoistControls() {
      const controls = useContext(CameraControlsContext);
      // eslint-disable-next-line react-compiler/react-compiler
      controlsRef = controls;
      return null;
    }
    const { act, fireDOMEvent } = await render(
      <Camera>
        <HoistControls />
      </Camera>,
    );

    await act(() => fireDOMEvent.keyDown(window, { key: "Shift" }));

    await act(() => {
      setDocumentFocus(false);
      vi.runAllTimers();
    });

    expect(controlsRef).toEqual({
      mouseButtons: defaultModifiers,
      touches: {},
    });
  });
});
