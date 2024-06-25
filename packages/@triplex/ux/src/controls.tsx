/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  AllSidesIcon,
  AngleIcon,
  BoxIcon,
  CameraIcon,
  ExitIcon,
  GridIcon,
  HeightIcon,
  MoveIcon,
  SizeIcon,
  TransformIcon,
} from "@radix-ui/react-icons";
import {
  send,
  type ButtonControl,
  type ButtonGroupControl,
  type ToggleButtonControl,
} from "@triplex/bridge/host";
import { useState } from "react";
import { LocalSpaceIcon, WorldSpaceIcon } from "./icons";

const icons = {
  "all-sides": AllSidesIcon,
  angle: AngleIcon,
  camera: CameraIcon,
  exit: ExitIcon,
  grid: GridIcon,
  "grid-perspective": () => (
    <div style={{ transform: "perspective(30px) rotateX(45deg)" }}>
      <GridIcon />
    </div>
  ),
  height: HeightIcon,
  local: LocalSpaceIcon,
  move: MoveIcon,
  size: SizeIcon,
  transform: TransformIcon,
  world: WorldSpaceIcon,
};

interface ControlProps<TControl> {
  children: (props: {
    Icon: () => JSX.Element;
    accelerator?: string;
    id: string;
    isSelected: boolean;
    label: string;
    onClick: () => void;
  }) => JSX.Element;
  control: TControl;
}

export function ToggleButtonControl({
  children,
  control,
}: ControlProps<ToggleButtonControl>) {
  const [index, setIndex] = useState(0);
  const button = control.buttons[index % control.buttons.length];

  return children({
    Icon: (button.icon ? icons[button.icon] : BoxIcon) as () => JSX.Element,
    accelerator: control.accelerator,
    id: control.id,
    isSelected: !!button.isSelected,
    label: button.label,
    onClick: async () => {
      const result = await send("control-triggered", { id: button.id }, true);
      if (result.handled) {
        setIndex((prev) => prev + 1);
      }
    },
  });
}

export function ButtonGroupControl({
  children,
  control,
}: ControlProps<ButtonGroupControl>) {
  const [selected, setSelected] = useState(control.defaultSelected);

  return (
    <>
      {control.buttons.map((control) =>
        children({
          Icon: (control.icon
            ? icons[control.icon]
            : BoxIcon) as () => JSX.Element,
          accelerator: control.accelerator,
          id: control.id,
          isSelected: control.id === selected,
          label: control.label,
          onClick: () => {
            send("control-triggered", { id: control.id });
            setSelected(control.id);
          },
        }),
      )}
    </>
  );
}

export function ButtonControl({
  children,
  control,
}: ControlProps<ButtonControl>) {
  return children({
    Icon: (control.icon ? icons[control.icon] : BoxIcon) as () => JSX.Element,
    accelerator: control.accelerator,
    id: control.id,
    isSelected: false,
    label: control.label,
    onClick: () => send("control-triggered", { id: control.id }),
  });
}
