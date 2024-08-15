/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEvent } from "@triplex/lib";
import { useEffect, useRef, useState, type FormEventHandler } from "react";
import tinycolor from "tinycolor2";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

export function ColorInput({
  actionId,
  children,
  defaultValue = "",
  name,
  onChange,
  onConfirm,
  persistedValue,
  required,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<
    { defaultValue: string | undefined; onBlur: () => void },
    HTMLInputElement,
    { clear: () => void; hasChanged: boolean }
  >;
  defaultValue?: string;
  name: string;
  onChange: (value: string | undefined) => void;
  onConfirm: (value: string | undefined) => void;
  persistedValue?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const persistedValueColor = persistedValue
    ? tinycolor(persistedValue)
    : undefined;
  const persistedValueHex = persistedValueColor
    ? persistedValueColor.toHexString()
    : undefined;
  const [hasChanged, setHasChanged] = useState(!!defaultValue);
  const telemetry = useTelemetry();
  const defaultValueHex = defaultValue
    ? tinycolor(defaultValue).toHexString()
    : "";
  const actualValueHex = persistedValueHex ?? defaultValueHex;

  useEffect(() => {
    if (ref.current) {
      ref.current.value = actualValueHex;
    }
  }, [defaultValue, actualValueHex]);

  const onChangeHandler: FormEventHandler<HTMLInputElement> = (e) => {
    if (e.target instanceof HTMLInputElement) {
      setHasChanged(true);
      onChange(e.target.value);
    }
  };

  const clearInputValue = useEvent(() => {
    if (persistedValue !== undefined) {
      onChange(undefined);
      onConfirm(undefined);
      setHasChanged(false);
      telemetry.event(`${actionId}_clear`);
    }
  });

  const onBlurHandler = () => {
    const nextValue = ref.current?.value;
    if (nextValue !== persistedValueHex) {
      setHasChanged(true);
      onConfirm(nextValue);
      telemetry.event(`${actionId}_confirm`);
    }
  };

  return children(
    {
      defaultValue: actualValueHex,
      id: name,
      onBlur: onBlurHandler,
      onChange: onChangeHandler,
      ref,
      required,
    },
    {
      clear: clearInputValue,
      hasChanged,
    },
  );
}
