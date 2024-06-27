/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type {
  BooleanLiteralType,
  NumberLiteralType,
  StringLiteralType,
} from "@triplex/server";
import {
  useEffect,
  useRef,
  type ChangeEventHandler,
  type KeyboardEventHandler,
} from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

export function LiteralUnionInput({
  actionId,
  children,
  name,
  onChange,
  onConfirm,
  persistedValue,
  required,
  values,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<
    {
      defaultValue: string | number | undefined;
      onChange: ChangeEventHandler<HTMLSelectElement>;
      onKeyDown: KeyboardEventHandler<HTMLSelectElement>;
      options: [label: string, value: string][];
    },
    HTMLSelectElement,
    { clear: () => void; isValuePersisted: boolean }
  >;
  name: string;
  onChange: (value: number | string | boolean | undefined) => void;
  onConfirm: (value: number | string | boolean | undefined) => void;
  persistedValue?: string | number | boolean;
  required?: boolean;
  values: (StringLiteralType | NumberLiteralType | BooleanLiteralType)[];
}) {
  const telemetry = useTelemetry();
  const ref = useRef<HTMLSelectElement>(null!);
  const isValueDefined = persistedValue !== undefined;

  useEffect(() => {
    const index = values.findIndex((v) => v.literal === persistedValue);
    ref.current.value = index !== -1 ? `${index}` : "";
  }, [persistedValue, values]);

  const onChangeHandler: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const currentValue = persistedValue ?? undefined;
    const nextValueIndex = e.target.value ?? undefined;

    if (nextValueIndex === undefined && required) {
      // Skip handler if the next value is undefined and it's required
      return;
    }

    const nextValue = values[Number(nextValueIndex)].literal;
    if (currentValue !== nextValue) {
      // If next value is defined we callback else we abort.
      // This is because the clear event handler handles empty values.
      onChange(nextValue);
      onConfirm(nextValue);
      telemetry.event(`${actionId}_confirm`);
    }
  };

  const onClear = () => {
    const index = values.findIndex((v) => v.literal === persistedValue);
    // Not an issue, see: https://github.com/facebook/react/issues/29106
    // eslint-disable-next-line react-compiler/react-compiler
    ref.current.value = index !== -1 ? `${index}` : "";

    onChange(undefined);
    onConfirm(undefined);
    telemetry.event(`${actionId}_clear`);
  };

  const onKeyDownHandler: KeyboardEventHandler<HTMLSelectElement> = (e) => {
    if (e.key === "Backspace" && !required) {
      onClear();
      ref.current.blur();
      telemetry.event(`${actionId}_clear`);
    }
  };

  const placeholderOption: [string, string] = ["Select value...", ""];
  const options: [string, string][] = values.map((value, index) => [
    `${value.label || value.literal}`,
    `${index}`,
  ]);

  return children(
    {
      defaultValue: values.findIndex((v) => v.literal === persistedValue),
      id: name,
      onChange: onChangeHandler,
      onKeyDown: onKeyDownHandler,
      options: isValueDefined ? options : [placeholderOption, ...options],
      ref,
    },
    { clear: onClear, isValuePersisted: isValueDefined },
  );
}
