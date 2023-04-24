import type { FocusEventHandler, ChangeEventHandler } from "react";

export function NumberInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
}: {
  defaultValue?: number;
  name: string;
  onChange: (value: number) => void;
  onConfirm: (value: number) => void;
}) {
  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.focus();
    onChange(e.target.valueAsNumber);
  };

  const onBlurHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    if (defaultValue !== e.target.valueAsNumber) {
      onConfirm(e.target.valueAsNumber);
    }
  };

  return (
    <div className="flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10">
      <input
        key={defaultValue}
        data-testid={`number-${defaultValue}`}
        id={name}
        type="number"
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        className="w-full bg-transparent py-0.5 px-1 text-sm text-neutral-300 outline-none [color-scheme:dark] [appearance:textfield]"
      />
    </div>
  );
}
