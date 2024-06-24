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
  name,
  onChange,
  onConfirm,
  persistedValue,
  required,
}: {
  actionId: ActionIdSafe;
  children: RenderInput<
    { defaultValue: string | undefined },
    HTMLInputElement,
    { clear: () => void; contrast: "light" | "dark"; hasChanged: boolean }
  >;
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
  const [hasChanged, setHasChanged] = useState(false);
  const telemetry = useTelemetry();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const cb = (e: Event) => {
      if (
        e.target instanceof HTMLInputElement &&
        persistedValueHex !== e.target.value
      ) {
        onConfirm(e.target.value);
        telemetry.event(`${actionId}_confirm`);
      }
    };

    const element = ref.current;
    element.addEventListener("change", cb);

    return () => {
      element.removeEventListener("change", cb);
    };
  }, [persistedValueHex, onConfirm, actionId, telemetry]);

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

  return children(
    {
      defaultValue: persistedValueHex,
      id: name,
      onChange: onChangeHandler,
      ref,
      required,
    },
    {
      clear: clearInputValue,
      contrast: persistedValueColor?.isLight() ? "light" : "dark",
      hasChanged,
    }
  );
}
