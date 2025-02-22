/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { bindAll } from "bind-event-listener";
import { default as CameraControlsInstance } from "camera-controls";
import { useContext, useEffect, useState, type ReactNode } from "react";
import { CameraControls as CameraControlsComponent } from "triplex-drei";
import { ActiveCameraContext, CameraControlsContext } from "./context";

const mouseHotkeys = {
  ctrl: {},
  rest: {
    left: CameraControlsInstance.ACTION.ROTATE,
    middle: CameraControlsInstance.ACTION.DOLLY,
    right: CameraControlsInstance.ACTION.TRUCK,
  },
  shift: {
    left: CameraControlsInstance.ACTION.TRUCK,
  },
} satisfies Record<string, Partial<CameraControlsInstance["mouseButtons"]>>;

const touchHotkeys = {
  ctrl: {},
  rest: {},
  shift: {},
} satisfies Record<string, Partial<CameraControlsInstance["touches"]>>;

function apply<TKey extends string>(
  a: Record<TKey, number>,
  b: Partial<Record<TKey, number>>,
) {
  const allB = b as Record<TKey, number>;
  for (const key in b) {
    a[key] = allB[key];
  }
}

export function CameraControls({ children }: { children: ReactNode }) {
  const camera = useContext(ActiveCameraContext);
  const [ref, setRef] = useState<CameraControlsInstance | null>(null);
  const [modifier, setModifier] = useState<"Rest" | "Shift" | "Control">(
    "Rest",
  );

  useEffect(() => {
    if (!ref) {
      return;
    }

    switch (modifier) {
      case "Control":
        apply(ref.touches, touchHotkeys.ctrl);
        apply(ref.mouseButtons, mouseHotkeys.ctrl);
        break;

      case "Shift":
        apply(ref.touches, touchHotkeys.shift);
        apply(ref.mouseButtons, mouseHotkeys.shift);
        break;

      default:
        apply(ref.touches, touchHotkeys.rest);
        apply(ref.mouseButtons, mouseHotkeys.rest);
        break;
    }
  }, [modifier, ref]);

  useEffect(() => {
    let intervalId: number;

    return bindAll(window, [
      {
        listener: (event) => {
          if (event.key !== "Shift" && event.key !== "Control") {
            setModifier("Rest");
            return;
          }

          function beginPollingForDocumentFocusLoss() {
            if (!document.hasFocus()) {
              // The iframe document doesn't have focus right now so the event
              // has originated from the parent document. We skip polling here
              // and instead wait for the next keyup event to reset the modifier.
              return;
            }

            window.clearInterval(intervalId);

            intervalId = window.setInterval(() => {
              if (!document.hasFocus()) {
                window.clearInterval(intervalId);
                setModifier("Rest");
              }
            }, 200);
          }

          switch (event.key) {
            case "Shift":
            case "Control":
              beginPollingForDocumentFocusLoss();
              setModifier(event.key);
              break;
          }
        },
        type: "keydown",
      },
      {
        listener: (event) => {
          switch (event.key) {
            case "Shift":
            case "Control":
              window.clearInterval(intervalId);
              setModifier("Rest");
              break;
          }
        },
        type: "keyup",
      },
      {
        listener: () => {
          if (document.visibilityState === "hidden") {
            window.clearInterval(intervalId);
            setModifier("Rest");
          }
        },
        type: "visibilitychange",
      },
    ]);
  }, []);

  return (
    <CameraControlsContext.Provider value={ref}>
      {children}
      {camera?.type === "editor" && (
        <CameraControlsComponent
          // We don't want user land cameras to be able to be affected by these controls
          // So we explicitly set the camera instead of relying on "default camera" behaviour.
          camera={camera.camera}
          ref={setRef}
        />
      )}
    </CameraControlsContext.Provider>
  );
}
