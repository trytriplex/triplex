/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  AllSidesIcon,
  AngleIcon,
  BoxIcon,
  CameraIcon,
  CursorArrowIcon,
  ExitIcon,
  GridIcon,
  HeightIcon,
  MoonIcon,
  MoveIcon,
  SizeIcon,
  SunIcon,
  TransformIcon,
} from "@radix-ui/react-icons";
import {
  on,
  send,
  type ButtonControl,
  type ButtonGroupControl,
  type ExtensionPointElement,
  type ToggleButtonControl,
} from "@triplex/bridge/host";
import { type Accelerator } from "@triplex/lib";
import { useEffect, useState, type JSX } from "react";
import { LocalSpaceIcon, WorldSpaceIcon } from "./icons";

const icons = {
  "all-sides": AllSidesIcon,
  angle: AngleIcon,
  camera: CameraIcon,
  cursor: CursorArrowIcon,
  exit: ExitIcon,
  grid: GridIcon,
  "grid-perspective": () => (
    <div
      style={{
        transform: "perspective(30px) rotateX(45deg)",
        width: 16,
      }}
    >
      <GridIcon />
    </div>
  ),
  height: HeightIcon,
  local: LocalSpaceIcon,
  moon: MoonIcon,
  move: MoveIcon,
  size: SizeIcon,
  sun: SunIcon,
  transform: TransformIcon,
  world: WorldSpaceIcon,
};

type ControlProps<TControl> = {
  children: (props: {
    Icon: () => JSX.Element;
    accelerator?: Accelerator;
    id: string;
    isSelected: boolean;
    label: string;
    onClick: () => void;
  }) => JSX.Element;
  control: TControl;
  data?: Record<string, unknown>;
} & ({ scope: "scene" } | { data: ExtensionPointElement; scope: "element" });

export function ToggleButtonControl({
  children,
  control,
  data,
  scope,
}: ControlProps<ToggleButtonControl>) {
  const [index, setIndex] = useState(0);
  const button = control.buttons[index % control.buttons.length];

  useEffect(() => {
    return on("extension-point-triggered", (data) => {
      const indexToSet = control.buttons.findIndex(
        (button) => button.id === data.id,
      );

      if (indexToSet === -1) {
        return;
      }

      setIndex(indexToSet);
    });
  }, [control.buttons]);

  return children({
    Icon: (button.icon ? icons[button.icon] : BoxIcon) as () => JSX.Element,
    accelerator: control.accelerator as Accelerator,
    id: button.id,
    isSelected: !!button.isSelected,
    label: button.label,
    onClick: async () => {
      const result = await send(
        "extension-point-triggered",
        scope === "scene"
          ? { id: button.id, scope }
          : { data, id: button.id, scope },
        true,
      );
      if (result.handled) {
        setIndex((prev) => prev + 1);
      }
    },
  });
}

export function ButtonGroupControl({
  children,
  control,
  data,
  scope,
}: ControlProps<ButtonGroupControl>) {
  const [selected, setSelected] = useState(control.defaultSelected);

  return (
    <>
      {control.buttons.map((button) =>
        children({
          Icon: (button.icon
            ? icons[button.icon]
            : BoxIcon) as () => JSX.Element,
          accelerator: button.accelerator as Accelerator,
          id: button.id,
          isSelected: button.id === selected,
          label: button.label,
          onClick: () => {
            send(
              "extension-point-triggered",
              scope === "scene"
                ? { id: button.id, scope }
                : { data, id: button.id, scope },
            );
            setSelected(button.id);
          },
        }),
      )}
    </>
  );
}

export function ButtonControl({
  children,
  control,
  data,
  scope,
}: ControlProps<ButtonControl>) {
  return children({
    Icon: (control.icon ? icons[control.icon] : BoxIcon) as () => JSX.Element,
    accelerator: control.accelerator as Accelerator,
    id: control.id,
    isSelected: false,
    label: control.label,
    onClick: () =>
      send(
        "extension-point-triggered",
        scope === "scene"
          ? { id: control.id, scope }
          : { data, id: control.id, scope },
      ),
  });
}
