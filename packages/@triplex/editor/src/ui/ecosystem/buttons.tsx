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
  type ButtonControl,
  type ButtonGroupControl,
  type ToggleButtonControl,
} from "@triplex/bridge/host";
import { type ActionIdSafe } from "@triplex/ux";
import { useState } from "react";
import { IconButton } from "../../ds/button";
import { LocalSpaceIcon, WorldSpaceIcon } from "../../ds/icons";

const icons = {
  "all-sides": AllSidesIcon,
  angle: AngleIcon,
  camera: CameraIcon,
  exit: ExitIcon,
  grid: GridIcon,
  "grid-perspective": () => (
    <div className="[transform:perspective(30px)_rotateX(45deg)]">
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
  actionId: ActionIdSafe;
  control: TControl;
  onClick: (id: string) => unknown;
  size?: "md" | "sm" | "xs";
}

export function ToggleButton({
  actionId,
  control,
  onClick,
  size,
}: ControlProps<ToggleButtonControl>) {
  const [index, setIndex] = useState(0);
  const button = control.buttons[index % control.buttons.length];

  return (
    <IconButton
      accelerator={control.accelerator}
      actionId={`${actionId}_${button.id}`}
      color="inherit"
      icon={button.icon ? icons[button.icon] : BoxIcon}
      isSelected={button.isSelected}
      label={button.label}
      onClick={async () => {
        const result = await onClick(button.id);
        if (
          result &&
          typeof result === "object" &&
          "handled" in result &&
          result.handled
        ) {
          setIndex((prev) => prev + 1);
        }
      }}
      size={size}
      testId={button.id}
    />
  );
}

export function ButtonGroup({
  actionId,
  control,
  onClick,
  size,
}: ControlProps<ButtonGroupControl>) {
  const [selected, setSelected] = useState(control.defaultSelected);

  return (
    <>
      {control.buttons.map((control) => (
        <IconButton
          accelerator={control.accelerator}
          actionId={`${actionId}_${control.id}`}
          color="inherit"
          icon={control.icon ? icons[control.icon] : BoxIcon}
          isSelected={control.id === selected}
          key={control.id}
          label={control.label}
          onClick={() => {
            onClick(control.id);
            setSelected(control.id);
          }}
          size={size}
          testId={control.id}
        />
      ))}
    </>
  );
}

export function Button({
  actionId,
  control,
  onClick,
  size,
}: ControlProps<ButtonControl>) {
  return (
    <IconButton
      accelerator={control.accelerator}
      actionId={`${actionId}_${control.id}`}
      color="inherit"
      icon={control.icon ? icons[control.icon] : BoxIcon}
      key={control.id}
      label={control.label}
      onClick={() => onClick(control.id)}
      size={size}
      testId={control.id}
    />
  );
}
