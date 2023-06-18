import type { ChangeEventHandler } from "react";
import { CheckIcon } from "@radix-ui/react-icons";
import { sentenceCase } from "../util/string";

export function BooleanInput({
  defaultValue,
  name,
  onChange,
  onConfirm,
  label,
}: {
  defaultValue: boolean;
  name: string;
  label?: string;
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
          key={`${defaultValue}`}
          data-testid={`boolean-${defaultValue}`}
          id={label ? name + "_" + label : name}
          type="checkbox"
          className="peer absolute inset-0 opacity-0"
          onChange={onChangeHandler}
          defaultChecked={defaultValue}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-blue-400 text-neutral-800 opacity-0 peer-checked:opacity-100">
          <CheckIcon />
        </div>
      </div>

      {label && (
        <label
          htmlFor={name + "_" + label}
          className="text-sm text-neutral-400"
        >
          {sentenceCase(label)}
        </label>
      )}
    </div>
  );
}
