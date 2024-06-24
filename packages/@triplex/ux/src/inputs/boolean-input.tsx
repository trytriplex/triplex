/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect, useRef, useState, type ChangeEventHandler } from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

export function BooleanInput({
  actionId,
  children,
  label,
  name,
  onChange,
  onConfirm,
  persistedValue,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<{ checked: boolean; defaultChecked: boolean }>;
  label?: string;
  name: string;
  onChange: (value?: boolean) => void;
  onConfirm: (value?: boolean) => void;
  persistedValue: boolean;
}) {
  const [value, setValue] = useState(persistedValue);
  const ref = useRef<HTMLInputElement>(null!);
  const telemetry = useTelemetry();

  useEffect(() => {
    ref.current.checked = persistedValue;
    setValue(persistedValue);
  }, [persistedValue]);

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.checked;
    onChange(nextValue);
    onConfirm(nextValue);
    setValue(nextValue);
    telemetry.event(`${actionId}_confirm`);
  };

  return children(
    {
      checked: value,
      defaultChecked: persistedValue,
      id: label ? name + "_" + label : name,
      onChange: onChangeHandler,
      ref,
    },
    {}
  );
}
