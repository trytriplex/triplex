import type { ChangeEventHandler } from "react";

export function BooleanInput({
  defaultValue,
  name,
  onChange,
  onConfirm,
}: {
  defaultValue: boolean;
  name: string;
  onChange: (value: boolean) => void;
  onConfirm: (value: boolean) => void;
}) {
  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.checked;
    onChange(value);
    onConfirm(value);
  };

  return (
    <input
      key={`${defaultValue}`}
      data-testid={`boolean-${defaultValue}`}
      id={name}
      type="checkbox"
      className="self-start accent-blue-400 [color-scheme:dark]"
      onChange={onChangeHandler}
      defaultChecked={defaultValue}
    />
  );
}
