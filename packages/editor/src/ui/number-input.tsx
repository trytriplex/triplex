import { Cross2Icon } from "@radix-ui/react-icons";
import type { FocusEventHandler, ChangeEventHandler } from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { sentenceCase } from "../util/string";

export function NumberInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
  required,
  label,
}: {
  required?: boolean;
  label?: string;
  defaultValue?: number;
  name: string;
  onChange: (value: number | undefined) => void;
  onConfirm: (value: number | undefined) => void;
}) {
  const emptyValue = required ? (name === "scale" ? 1 : 0) : undefined;

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.focus();
    const nextValue = e.target.valueAsNumber || emptyValue;
    onChange(nextValue);
  };

  const onBlurHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    const nextValue = e.target.valueAsNumber || emptyValue;
    if (defaultValue !== nextValue) {
      onConfirm(nextValue);
    }
  };

  const onClear = () => {
    onChange(emptyValue);
    onConfirm(emptyValue);
  };

  return (
    <div
      className={cn([
        "group flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10",
        !required ? "pl-1 pr-0.5" : "px-1",
      ])}
    >
      <input
        placeholder={label ? sentenceCase(label) : undefined}
        required={required}
        key={defaultValue}
        data-testid={`number-${defaultValue}`}
        id={name}
        type="number"
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        className="w-full bg-transparent py-0.5 text-sm text-neutral-300 outline-none [color-scheme:dark] [appearance:textfield] placeholder:italic placeholder:text-neutral-500"
      />

      {typeof defaultValue !== "undefined" && (
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
