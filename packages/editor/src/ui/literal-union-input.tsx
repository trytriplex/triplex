import { ChangeEventHandler, useRef } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Prop } from "../api-types";
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
  defaultValue?: string | number;
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

  const onClear = () => {
    ref.current!.value = "";
    onChange(undefined);
    onConfirm(undefined);
  };

  return (
    <div className="group flex w-full items-center rounded-md border border-transparent bg-white/5 px-0.5 focus-within:border-blue-400 hover:bg-white/10">
      <select
        key={defaultValue}
        ref={ref}
        data-testid={`select-${name}`}
        id={name}
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        className={cn([
          defaultValue ? "text-neutral-300" : "text-neutral-500",
          "w-full appearance-none overflow-hidden text-ellipsis bg-transparent p-0.5 text-sm outline-none [color-scheme:dark]",
        ])}
      >
        {!defaultValue && <option value="">Select value...</option>}
        {values.map((value) => (
          <option key={`${value.value}`}>{`${value.value}`}</option>
        ))}
      </select>

      {!required && defaultValue && (
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
