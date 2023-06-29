import { Cross2Icon } from "@radix-ui/react-icons";
import type { FocusEventHandler, ChangeEventHandler } from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { sentenceCase } from "../util/string";
import { usePropTags } from "./prop-input";

export function NumberInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
  required,
  label,
  transformValue = { in: (value) => value, out: (value) => value },
}: {
  required?: boolean;
  label?: string;
  defaultValue?: number;
  name: string;
  onChange: (value: number | undefined) => void;
  onConfirm: (value: number | undefined) => void;
  transformValue?: {
    in: (value: number | undefined) => number | undefined;
    out: (value: number | undefined) => number | undefined;
  };
}) {
  const tags = usePropTags();

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.focus();

    const nextValue = Number.isNaN(e.target.valueAsNumber)
      ? undefined
      : e.target.valueAsNumber;

    onChange(transformValue.out(nextValue));
  };

  const onBlurHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    const nextValue = Number.isNaN(e.target.valueAsNumber)
      ? undefined
      : e.target.valueAsNumber;

    if (nextValue === undefined && required) {
      // Skip handler if the next value is undefined and it's required
      return;
    }

    if (defaultValue !== nextValue) {
      onConfirm(transformValue.out(nextValue));
    }
  };

  const onClear = () => {
    onChange(undefined);
    onConfirm(undefined);
  };

  return (
    <div
      className={cn([
        "group flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10",
        !required ? "pl-1 pr-0.5" : "px-1",
      ])}
    >
      <input
        max={typeof tags.max === "boolean" ? undefined : tags.max}
        min={typeof tags.min === "boolean" ? undefined : tags.min}
        placeholder={label ? sentenceCase(label) : undefined}
        required={required}
        key={defaultValue}
        data-testid={`number-${defaultValue}`}
        id={name}
        type="number"
        defaultValue={transformValue.in(defaultValue)}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        className="w-full bg-transparent py-0.5 text-sm text-neutral-300 outline-none [appearance:textfield] [color-scheme:dark] placeholder:italic placeholder:text-neutral-500"
      />

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
