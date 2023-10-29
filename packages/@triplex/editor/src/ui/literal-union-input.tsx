/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Cross2Icon } from "@radix-ui/react-icons";
import type {
  BooleanLiteralType,
  NumberLiteralType,
  StringLiteralType,
} from "@triplex/server";
import { ChangeEventHandler, useRef } from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";

export function LiteralUnionInput({
  defaultValue,
  name,
  onChange,
  onConfirm,
  required,
  values,
}: {
  defaultValue?: string | number | boolean;
  name: string;
  onChange: (value: number | string | boolean | undefined) => void;
  onConfirm: (value: number | string | boolean | undefined) => void;
  required?: boolean;
  values: (StringLiteralType | NumberLiteralType | BooleanLiteralType)[];
}) {
  const ref = useRef<HTMLSelectElement>(null);
  const isValueDefined = defaultValue !== undefined;

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
    }
  };

  const onClear = () => {
    ref.current!.value = "";
    onChange(undefined);
    onConfirm(undefined);
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
        key={`${defaultValue}`}
        onChange={onChangeHandler}
        ref={ref}
      >
        {!isValueDefined && <option value="">Select value...</option>}
        {values.map((value, index) => (
          <option key={`${value.literal}`} value={index}>{`${
            value.label || value.literal
          }`}</option>
        ))}
      </select>

      {!required && (
        <IconButton
          className="hidden group-focus-within:block group-hover:block"
          icon={Cross2Icon}
          label="Clear value"
          onClick={onClear}
          size="xs"
        />
      )}
    </div>
  );
}
