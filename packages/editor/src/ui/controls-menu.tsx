/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  AllSidesIcon,
  TransformIcon,
  AngleIcon,
  GridIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { listen, compose } from "@triplex/bridge/host";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";

const cameraTitles = {
  perspective: "Switch to orthographic",
  orthographic: "Switch to perspective",
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
  const { setTransform, setCameraType } = useScene();

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
    <div className="pointer-events-auto mx-auto mt-auto flex rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1">
      <IconButton
        isSelected={mode === "translate"}
        title="Translate (T)"
        icon={AllSidesIcon}
        onClick={() => setTransform("translate")}
      />
      <IconButton
        isSelected={mode === "rotate"}
        title="Rotate (R)"
        icon={AngleIcon}
        onClick={() => setTransform("rotate")}
      />
      <IconButton
        isSelected={mode === "scale"}
        title="Scale (S)"
        icon={TransformIcon}
        onClick={() => setTransform("scale")}
      />
      <div className="-my-1 mx-1 w-[1px] bg-neutral-800" />
      <IconButton
        isSelected={camera === "user"}
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
        title={camera ? cameraTitles[camera] : ""}
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
      />
    </div>
  );
}
