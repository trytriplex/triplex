import { ChangeEventHandler, MouseEventHandler, useRef } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Prop } from "../api-types";

export function LiteralUnionInput({
  defaultValue,
  values,
  name,
  onChange,
  onConfirm,
  required,
}: {
  defaultValue: string | number;
  name: string;
  values: Prop[];
  required?: boolean;
  onChange: (value: number | string | undefined) => void;
  onConfirm: (value: number | string | undefined) => void;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  const onChangeHandler: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const currentValue = defaultValue ?? undefined;
    const nextValue = e.target.value ?? undefined;

    if (currentValue !== nextValue && nextValue) {
      // If next value is defined we callback else we abort.
      // This is because the clear event handler handles empty values.
      onChange(nextValue);
      onConfirm(nextValue);
    }
  };

  const onClear: MouseEventHandler<HTMLButtonElement> = () => {
    ref.current!.value = "";

    if (defaultValue !== undefined) {
      onChange(undefined);
      onConfirm(undefined);
    }
  };

  return (
    <div className="flex w-full items-center rounded-md border border-transparent bg-white/5 px-0.5 focus-within:border-blue-400 hover:bg-white/10">
      <select
        key={defaultValue}
        ref={ref}
        data-testid={`select-${name}`}
        id={name}
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        className="w-full appearance-none bg-transparent p-0.5 text-sm text-neutral-300 outline-none [color-scheme:dark]"
      >
        {!defaultValue && <option value="">Select value...</option>}
        {values.map((value) => (
          <option key={`${value.value}`}>{`${value.value}`}</option>
        ))}
      </select>

      {!required && defaultValue && (
        <button
          type="submit"
          className="rounded p-0.5 text-neutral-400 hover:bg-white/5 active:bg-white/5"
          onClick={onClear}
          title="Clear value"
          aria-label="Clear"
        >
          <Cross2Icon />
        </button>
      )}
    </div>
  );
}
