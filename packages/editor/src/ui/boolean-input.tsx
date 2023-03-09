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
  return (
    <input
      data-testid={`boolean-${defaultValue}`}
      id={name}
      type="checkbox"
      className="self-start accent-blue-300 [color-scheme:dark]"
      onChange={(e) => {
        const value = e.target.checked;
        onChange(value);
        onConfirm(value);
      }}
      defaultChecked={defaultValue}
    />
  );
}
