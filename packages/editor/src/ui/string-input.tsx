import type { ChangeEventHandler, FocusEventHandler } from "react";

export function StringInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
}: {
  defaultValue: string;
  name: string;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
}) {
  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
  };

  const onBlurHandler: FocusEventHandler<HTMLInputElement> = (e) => {
    if (defaultValue !== e.target.value) {
      onConfirm(e.target.value);
    }
  };

  return (
    <div className="flex w-full items-center rounded-md border border-transparent bg-white/5 focus-within:border-blue-400 hover:bg-white/10">
      <input
        key={defaultValue}
        data-testid={`string-${defaultValue}`}
        id={name}
        type="text"
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        className="w-full bg-transparent py-0.5 px-1 text-sm text-neutral-300 outline-none [color-scheme:dark]"
      />
    </div>
  );
}
