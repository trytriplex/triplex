import { Cross2Icon } from "@radix-ui/react-icons";
import type { ChangeEventHandler, FocusEventHandler } from "react";
import { IconButton } from "../ds/button";
import { sentenceCase } from "../util/string";

export function StringInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
  required,
  label,
}: {
  label?: string;
  defaultValue?: string;
  required?: boolean;
  name: string;
  onChange: (value: string | undefined) => void;
  onConfirm: (value: string | undefined) => void;
}) {
  const emptyValue = required ? "" : undefined;

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.value || emptyValue;
    onChange(nextValue);
  };

  const onBlurHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.value || emptyValue;
    if (defaultValue !== nextValue) {
      onConfirm(nextValue);
    }
  };

  const onClear = () => {
    onChange(emptyValue);
    onConfirm(emptyValue);
  };

  return (
    <div className="group flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10">
      <input
        placeholder={label ? sentenceCase(label) : undefined}
        required={required}
        key={defaultValue}
        data-testid={`string-${defaultValue}`}
        id={name}
        type="text"
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        className="w-full bg-transparent py-0.5 px-1 text-sm text-neutral-300 outline-none [color-scheme:dark] placeholder:italic placeholder:text-neutral-500"
      />

      {defaultValue && (
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
