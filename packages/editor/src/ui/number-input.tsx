export function NumberInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
}: {
  defaultValue: number;
  name: string;
  onChange: (value: number) => void;
  onConfirm: (value: number) => void;
}) {
  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.target.focus();
    onChange(e.target.valueAsNumber);
  };

  return (
    <div className="flex w-full items-center rounded border-2 border-neutral-600">
      <input
        data-testid={`number-${defaultValue}`}
        id={name}
        type="number"
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={(e) => onConfirm(e.target.valueAsNumber)}
        className="w-full bg-transparent py-0.5 px-1 text-sm text-neutral-300 outline-none [color-scheme:dark]"
      />
    </div>
  );
}
