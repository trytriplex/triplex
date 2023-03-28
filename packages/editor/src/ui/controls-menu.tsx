import {
  AllSidesIcon,
  DimensionsIcon,
  RotateCounterClockwiseIcon,
} from "@radix-ui/react-icons";
import { listen } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import { IconButton } from "../ds/button";
import { useScene } from "../stores/scene";

export function ControlsMenu() {
  const [mode, setMode] = useState<"translate" | "scale" | "rotate" | null>(
    null
  );
  const { setTransform } = useScene();

  useEffect(() => {
    return listen("trplx:onTransformChange", ({ mode }) => {
      setMode(mode);
    });
  });

  return (
    <div className="pointer-events-auto flex self-end rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 shadow-2xl shadow-black/50">
      <IconButton
        isSelected={mode === "translate"}
        title="Translate [t]"
        icon={AllSidesIcon}
        onClick={() => setTransform("translate")}
      />
      <IconButton
        isSelected={mode === "rotate"}
        title="Rotate [r]"
        icon={RotateCounterClockwiseIcon}
        onClick={() => setTransform("rotate")}
      />
      <IconButton
        isSelected={mode === "scale"}
        title="Scale [s]"
        icon={DimensionsIcon}
        onClick={() => setTransform("scale")}
      />
    </div>
  );
}
