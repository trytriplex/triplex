/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect, useRef, type ChangeEventHandler } from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

function parseValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function BooleanInput({
  actionId,
  children,
  defaultValue = false,
  label,
  name,
  onChange,
  onConfirm,
  persistedValue,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<{ defaultChecked: boolean }>;
  defaultValue?: boolean;
  label?: string;
  name: string;
  onChange: (value?: boolean) => void;
  onConfirm: (value?: boolean) => void;
  persistedValue?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null!);
  const telemetry = useTelemetry();
  const initialValue = parseValue(persistedValue) ?? defaultValue;

  useEffect(() => {
    ref.current.checked = initialValue;
  }, [initialValue]);

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.checked;
    onChange(nextValue);
    onConfirm(nextValue);
    telemetry.event(`${actionId}_confirm`);
  };

  return children(
    // Waiting to hear back if this is a false positive.
    // See: https://github.com/reactwg/react-compiler/discussions/32
    // eslint-disable-next-line react-compiler/react-compiler
    {
      defaultChecked: !!initialValue,
      id: label ? name + "_" + label : name,
      onChange: onChangeHandler,
      ref,
    },
    {},
  );
}
