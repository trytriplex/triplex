/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ChangeEventHandler, useRef } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import type {
  StringLiteralType,
  NumberLiteralType,
  BooleanLiteralType,
} from "@triplex/server";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";

export function LiteralUnionInput({
  defaultValue,
  values,
  name,
  onChange,
  onConfirm,
  required,
}: {
  defaultValue?: string | number | boolean;
  name: string;
  values: (StringLiteralType | NumberLiteralType | BooleanLiteralType)[];
  required?: boolean;
  onChange: (value: number | string | boolean | undefined) => void;
  onConfirm: (value: number | string | boolean | undefined) => void;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  const isValueDefined = typeof defaultValue !== "undefined";

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
        key={`${defaultValue}`}
        ref={ref}
        data-testid={`select-${name}`}
        id={name}
        defaultValue={values.findIndex((v) => v.literal === defaultValue)}
        onChange={onChangeHandler}
        className={cn([
          isValueDefined ? "text-neutral-300" : "text-neutral-500",
          "w-full appearance-none overflow-hidden text-ellipsis bg-transparent px-1 py-0.5 text-sm outline-none [color-scheme:dark]",
        ])}
      >
        {!isValueDefined && <option value="">Select value...</option>}
        {values.map((value, index) => (
          <option
            value={index}
            key={`${value.literal}`}
          >{`${value.literal}`}</option>
        ))}
      </select>

      {!required && (
        <IconButton
          className="hidden group-focus-within:block group-hover:block"
          onClick={onClear}
          size="tight"
          icon={Cross2Icon}
          title="Clear value"
        />
      )}
    </div>
  );
}
