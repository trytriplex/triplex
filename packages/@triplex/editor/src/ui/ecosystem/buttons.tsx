/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type {
  ButtonControl,
  ButtonGroupControl,
  ExtensionPointElement,
  ToggleButtonControl,
} from "@triplex/bridge/host";
import {
  ButtonControl as ButtonControlImpl,
  ButtonGroupControl as ButtonGroupControlImpl,
  ToggleButtonControl as ToggleButtonControlImpl,
  type ActionIdSafe,
} from "@triplex/ux";
import { IconButton } from "../../ds/button";

type ControlProps<TControl> = {
  actionId: ActionIdSafe;
  control: TControl;
  data?: Record<string, unknown>;
  size?: "md" | "sm" | "xs";
} & ({ scope: "scene" } | { data: ExtensionPointElement; scope: "element" });

export function ToggleButton({
  actionId,
  control,
  data,
  scope,
  size,
}: ControlProps<ToggleButtonControl>) {
  const props = scope === "scene" ? { scope } : { data, scope };

  return (
    <ToggleButtonControlImpl control={control} {...props}>
      {(button) => (
        <IconButton
          accelerator={control.accelerator}
          actionId={`${actionId}_${button.id}`}
          color="inherit"
          icon={button.Icon}
          isSelected={button.isSelected}
          label={button.label}
          onClick={button.onClick}
          size={size}
          testId={button.id}
        />
      )}
    </ToggleButtonControlImpl>
  );
}

export function ButtonGroup({
  actionId,
  control,
  data,
  scope,
  size,
}: ControlProps<ButtonGroupControl>) {
  const props = scope === "scene" ? { scope } : { data, scope };

  return (
    <ButtonGroupControlImpl control={control} {...props}>
      {(button) => (
        <IconButton
          accelerator={button.accelerator}
          actionId={`${actionId}_${button.id}`}
          color="inherit"
          icon={button.Icon}
          isSelected={button.isSelected}
          key={button.id}
          label={button.label}
          onClick={button.onClick}
          size={size}
          testId={button.id}
        />
      )}
    </ButtonGroupControlImpl>
  );
}

export function Button({
  actionId,
  control,
  data,
  scope,
  size,
}: ControlProps<ButtonControl>) {
  const props = scope === "scene" ? { scope } : { data, scope };

  return (
    <ButtonControlImpl control={control} {...props}>
      {(button) => (
        <IconButton
          accelerator={button.accelerator}
          actionId={`${actionId}_${button.id}`}
          color="inherit"
          icon={button.Icon}
          key={button.id}
          label={button.label}
          onClick={button.onClick}
          size={size}
          testId={button.id}
        />
      )}
    </ButtonControlImpl>
  );
}
