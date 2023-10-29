/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  AllSidesIcon,
  AngleIcon,
  ExitIcon,
  GridIcon,
  TransformIcon,
} from "@radix-ui/react-icons";
import { compose, listen } from "@triplex/bridge/host";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";

const cameraTitles = {
  orthographic: "Switch to perspective",
  perspective: "Switch to orthographic",
  user: "Exit camera",
};

export function ControlsMenu() {
  const [mode, setMode] = useState<
    "translate" | "scale" | "rotate" | undefined
  >();
  const [camera, setCamera] = useState<
    "perspective" | "orthographic" | "user" | undefined
  >();
  const lastKnownTriplexCamera = useRef<"perspective" | "orthographic">();
  const { setCameraType, setTransform } = useScene();

  useEffect(() => {
    return compose([
      listen("trplx:onStateChange", ({ change }) => {
        if (change === "userCamera") {
          setCamera("user");
        }
      }),
      listen("trplx:onCameraTypeChange", ({ type }) => {
        setCamera(type);
        lastKnownTriplexCamera.current = type;
      }),
      listen("trplx:onTransformChange", ({ mode }) => {
        setMode(mode);
      }),
    ]);
  });

  return (
    <div
      className="pointer-events-auto mx-auto mt-auto flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1"
      data-testid="controls-menu"
    >
      <IconButton
        icon={AllSidesIcon}
        isSelected={mode === "translate"}
        label="Translate (T)"
        onClick={() => setTransform("translate")}
        testId="translate"
      />
      <IconButton
        icon={AngleIcon}
        isSelected={mode === "rotate"}
        label="Rotate (R)"
        onClick={() => setTransform("rotate")}
        testId="rotate"
      />
      <IconButton
        icon={TransformIcon}
        isSelected={mode === "scale"}
        label="Scale (S)"
        onClick={() => setTransform("scale")}
        testId="scale"
      />
      <div className="-my-1 mx-1 w-[1px] bg-neutral-800" />
      <IconButton
        icon={
          camera === "user"
            ? ExitIcon
            : () => (
                <div
                  className={
                    camera === "perspective"
                      ? "[transform:perspective(30px)_rotateX(45deg)]"
                      : undefined
                  }
                >
                  <GridIcon />
                </div>
              )
        }
        isSelected={camera === "user"}
        label={camera ? cameraTitles[camera] : ""}
        onClick={() => {
          if (camera === "user" && lastKnownTriplexCamera.current) {
            setCameraType(lastKnownTriplexCamera.current);
          } else {
            const nextCamera =
              camera === "perspective" ? "orthographic" : "perspective";
            setCameraType(nextCamera);
            lastKnownTriplexCamera.current = nextCamera;
          }
        }}
        testId={`${camera}-camera`}
      />
    </div>
  );
}
