import { Cross2Icon } from "@radix-ui/react-icons";
import {
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
} from "react";
import { IconButton } from "../ds/button";
import { sentenceCase } from "../util/string";

const noop = () => {};

export function StringInput({
  defaultValue,
  name,
  onConfirm = noop,
  onChange = noop,
  required,
  label,
}: {
  label?: string;
  defaultValue?: string;
  required?: boolean;
  name: string;
  onChange?: (value: string | undefined) => void;
  onConfirm?: (value: string | undefined) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.value || undefined;
    if (nextValue === undefined && required) {
      // Ignore calling back if it's required
      return;
    }

    onChange(nextValue);
    setValue(nextValue);
  };

  const onBlurHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.value || undefined;
    if (nextValue === undefined && required) {
      // Ignore calling back if it's required
      return;
    }

    if (defaultValue !== nextValue) {
      onConfirm(nextValue);
    }
  };

  const onClear = () => {
    onChange(undefined);
    onConfirm(undefined);
  };

  return (
    <div className="group flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10">
      <input
        aria-label={label}
        placeholder={label ? sentenceCase(label) : undefined}
        required={required}
        key={defaultValue}
        data-testid={`string-${defaultValue}`}
        id={name}
        type="text"
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        className="w-full bg-transparent px-1.5 py-0.5 text-sm text-neutral-300 outline-none [color-scheme:dark] placeholder:italic placeholder:text-neutral-500"
      />

      {!required && value && (
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
