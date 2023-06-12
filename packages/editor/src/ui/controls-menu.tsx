import {
  AllSidesIcon,
  TransformIcon,
  AngleIcon,
  GridIcon,
} from "@radix-ui/react-icons";
import { listen, compose } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";

export function ControlsMenu() {
  const [mode, setMode] = useState<"translate" | "scale" | "rotate" | null>(
    null
  );
  const [camera, setCamera] = useState<"perspective" | "orthographic" | null>(
    null
  );
  const { setTransform, setCameraType } = useScene();

  useEffect(() => {
    return compose([
      listen("trplx:onCameraTypeChange", ({ type }) => {
        setCamera(type);
      }),
      listen("trplx:onTransformChange", ({ mode }) => {
        setMode(mode);
      }),
    ]);
  });

  return (
    <div className="pointer-events-auto flex self-end rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1">
      <IconButton
        isSelected={mode === "translate"}
        title="Translate [t]"
        icon={AllSidesIcon}
        onClick={() => setTransform("translate")}
      />
      <IconButton
        isSelected={mode === "rotate"}
        title="Rotate [r]"
        icon={AngleIcon}
        onClick={() => setTransform("rotate")}
      />
      <IconButton
        isSelected={mode === "scale"}
        title="Scale [s]"
        icon={TransformIcon}
        onClick={() => setTransform("scale")}
      />
      <div className="-my-1 mx-1 w-[1px] bg-neutral-800" />
      <IconButton
        onClick={() =>
          setCameraType(
            camera === "perspective" ? "orthographic" : "perspective"
          )
        }
        title={
          camera === "perspective"
            ? "Switch to orthographic"
            : "Switch to perspective"
        }
        icon={() => (
          <div
            className={
              camera === "perspective"
                ? "[transform:perspective(30px)_rotateX(45deg)]"
                : undefined
            }
          >
            <GridIcon />
          </div>
        )}
      />
    </div>
  );
}
