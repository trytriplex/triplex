import { FormEventHandler, useEffect, useRef } from "react";
import tinycolor from "tinycolor2";

export function ColorInput({
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
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const cb = (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        onConfirm(e.target.value);
      }
    };

    const element = ref.current;

    element.addEventListener("change", cb);

    return () => {
      element.removeEventListener("change", cb);
    };
  }, [onConfirm]);

  const onChangeCallback: FormEventHandler<HTMLInputElement> = (e) => {
    if (e.target instanceof HTMLInputElement) {
      onChange(e.target.value);
    }
  };

  return (
    <input
      key={defaultValue}
      data-testid={`color-${defaultValue}`}
      id={name}
      type="color"
      className="h-7 w-7 rounded border-2 border-neutral-600 p-1 outline-none [color-scheme:dark]"
      defaultValue={tinycolor(defaultValue).toHexString()}
      onChange={onChangeCallback}
      ref={ref}
    />
  );
}
