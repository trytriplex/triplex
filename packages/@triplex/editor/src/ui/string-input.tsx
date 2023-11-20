/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState, type KeyboardEventHandler } from "react";
import { IconButton } from "../ds/button";
import { sentenceCase } from "../util/string";
import useEvent from "../util/use-event";

const noop = () => {};

export function StringInput({
  autoFocus,
  defaultValue,
  label,
  name,
  onChange = noop,
  onConfirm = noop,
  required,
}: {
  autoFocus?: boolean;
  defaultValue?: string;
  label?: string;
  name: string;
  onChange?: (value: string | undefined) => void;
  onConfirm?: (value: string | undefined) => void;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const ref = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    ref.current.value = defaultValue || "";
  }, [defaultValue]);

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

    if (defaultValue !== nextValue) {
      onConfirm(nextValue);
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

  return (
    <div className="group flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10">
      <input
        aria-label={label}
        autoFocus={autoFocus}
        className="w-full bg-transparent px-1.5 py-0.5 text-sm text-neutral-300 outline-none [color-scheme:dark] placeholder:italic placeholder:text-neutral-500"
        data-testid={`string-${defaultValue}`}
        defaultValue={defaultValue}
        id={name}
        onBlur={onConfirmHandler}
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
        placeholder={label ? sentenceCase(label) : undefined}
        ref={ref}
        required={required}
        type="text"
      />

      {!required && value && (
        <IconButton
          actionId="clear_prop_value"
          className="hidden group-focus-within:block group-hover:block"
          icon={Cross2Icon}
          label="Clear value"
          onClick={onClear}
          size="xs"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
