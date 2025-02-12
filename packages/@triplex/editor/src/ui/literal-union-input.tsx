/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { ChevronDownIcon, Cross2Icon } from "@radix-ui/react-icons";
import type {
  BooleanLiteralType,
  NumberLiteralType,
  StringLiteralType,
} from "@triplex/server";
import { useTelemetry, type ActionIdSafe } from "@triplex/ux";
import {
  useEffect,
  useRef,
  type ChangeEventHandler,
  type KeyboardEventHandler,
} from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";

export function LiteralUnionInput({
  actionId,
  defaultValue,
  name,
  onChange,
  onConfirm,
  required,
  values,
}: {
  actionId: ActionIdSafe;
  defaultValue?: string | number | boolean;
  name: string;
  onChange: (value: number | string | boolean | undefined) => void;
  onConfirm: (value: number | string | boolean | undefined) => void;
  required?: boolean;
  values: (StringLiteralType | NumberLiteralType | BooleanLiteralType)[];
}) {
  const telemetry = useTelemetry();
  const ref = useRef<HTMLSelectElement>(null!);
  const isValueDefined = defaultValue !== undefined;

  useEffect(() => {
    const index = values.findIndex((v) => v.literal === defaultValue);
    ref.current.value = index !== -1 ? `${index}` : "";
  }, [defaultValue, values]);

  const onChangeHandler: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const currentValue = defaultValue ?? undefined;
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
    const index = values.findIndex((v) => v.literal === defaultValue);
    ref.current.value = index !== -1 ? `${index}` : "";

    onChange(undefined);
    onConfirm(undefined);
    telemetry.event(`${actionId}_clear`);
  };

  const onKeyDownHandler: KeyboardEventHandler<HTMLSelectElement> = (e) => {
    if (e.key === "Backspace") {
      onClear();
      telemetry.event(`${actionId}_clear`);
    }
  };

  return (
    <div className="group flex w-full items-center rounded-md border border-transparent bg-white/5 px-0.5 focus-within:border-blue-400 hover:bg-white/10">
      <select
        className={cn([
          isValueDefined ? "text-neutral-300" : "text-neutral-500",
          "w-full appearance-none overflow-hidden text-ellipsis bg-transparent px-1 py-0.5 text-sm outline-none [color-scheme:dark]",
        ])}
        data-testid={`select-${name}`}
        defaultValue={values.findIndex((v) => v.literal === defaultValue)}
        id={name}
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
        ref={ref}
      >
        {!isValueDefined && <option value="">Select value...</option>}
        {values.map((value, index) => (
          <option
            key={`${value.label}-${value.literal}-${index}`}
            value={index}
          >{`${value.label || value.literal}`}</option>
        ))}
      </select>

      <ChevronDownIcon className="mr-1 text-neutral-400 group-focus-within:hidden group-hover:hidden" />

      {!required && (
        <IconButton
          actionId={`${actionId}_clear`}
          className="hidden group-focus-within:block group-hover:block"
          icon={Cross2Icon}
          label="Clear Value"
          onClick={onClear}
          size="xs"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
