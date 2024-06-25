/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { noop, useEvent } from "@triplex/lib";
import {
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
} from "react";
import { useTelemetry, type ActionIdSafe } from "../telemetry";
import { type RenderInput } from "./types";

export function StringInput({
  actionId,
  children,
  label,
  name,
  onChange = noop,
  onConfirm = noop,
  persistedValue,
  required,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<{
    defaultValue: string | undefined;
    onBlur: FocusEventHandler<HTMLInputElement>;
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
    placeholder?: string;
    value: string | undefined;
  }>;
  label?: string;
  name: string;
  onChange?: (value: string | undefined) => void;
  onConfirm?: (value: string | undefined) => void;
  persistedValue?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(persistedValue);
  const ref = useRef<HTMLInputElement>(null!);
  const telemetry = useTelemetry();

  useEffect(() => {
    ref.current.value = persistedValue || "";
    setValue(persistedValue || "");
  }, [persistedValue]);

  const onChangeHandler = useEvent(() => {
    const nextValue = ref.current.value || undefined;
    if (nextValue === undefined && required) {
      // Ignore calling back if it's required
      return;
    }

    onChange(nextValue);
    setValue(nextValue);
  });

  const onConfirmHandler = useEvent(() => {
    const nextValue = ref.current.value || undefined;
    if (nextValue === undefined && required) {
      // Ignore calling back if it's required
      return;
    }

    if (persistedValue !== nextValue) {
      onConfirm(nextValue);
      telemetry.event(`${actionId}_confirm`);
    }
  });

  const onClear = useEvent(() => {
    onChange(undefined);
    onConfirm(undefined);
  });

  const onKeyDownHandler: KeyboardEventHandler<HTMLInputElement> = useEvent(
    (e) => {
      if (e.key === "Enter") {
        ref.current.blur();
      }
    }
  );

  return children(
    {
      defaultValue: persistedValue,
      id: name,
      onBlur: onConfirmHandler,
      onChange: onChangeHandler,
      onKeyDown: onKeyDownHandler,
      placeholder: label,
      ref,
      required,
      value,
    },
    {
      clear: onClear,
    }
  );
}
