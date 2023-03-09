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
  return (
    <div className="flex w-full items-center rounded border-2 border-neutral-600">
      <input
        data-testid={`string-${defaultValue}`}
        id={name}
        type="text"
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onConfirm(e.target.value)}
        className="w-full bg-transparent py-0.5 px-1 text-sm text-neutral-300 outline-none [color-scheme:dark]"
      />
    </div>
  );
}
