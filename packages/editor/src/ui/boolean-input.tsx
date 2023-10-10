/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CheckIcon } from "@radix-ui/react-icons";
import type { ChangeEventHandler } from "react";
import { sentenceCase } from "../util/string";

export function BooleanInput({
  defaultValue,
  label,
  name,
  onChange,
  onConfirm,
}: {
  defaultValue: boolean;
  label?: string;
  name: string;
  onChange: (value?: boolean) => void;
  onConfirm: (value?: boolean) => void;
}) {
  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.checked;
    onChange(nextValue);
    onConfirm(nextValue);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="relative h-3.5 w-3.5 rounded bg-neutral-700 outline-1 outline-blue-400 after:pointer-events-none after:absolute after:inset-0 after:rounded focus-within:outline hover:after:bg-white/5 active:after:bg-white/10">
        <input
          className="peer absolute inset-0 opacity-0"
          data-testid={`boolean-${defaultValue}`}
          defaultChecked={defaultValue}
          id={label ? name + "_" + label : name}
          key={`${defaultValue}`}
          onChange={onChangeHandler}
          type="checkbox"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-blue-400 text-neutral-800 opacity-0 peer-checked:opacity-100">
          <CheckIcon />
        </div>
      </div>

      {label && (
        <label
          className="text-sm text-neutral-400"
          htmlFor={name + "_" + label}
        >
          {sentenceCase(label)}
        </label>
      )}
    </div>
  );
}
