/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
