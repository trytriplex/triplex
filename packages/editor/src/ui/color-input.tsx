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
  const defaultValueHex = tinycolor(defaultValue).toHexString();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const cb = (e: Event) => {
      if (
        e.target instanceof HTMLInputElement &&
        defaultValueHex !== e.target.value
      ) {
        onConfirm(e.target.value);
      }
    };

    const element = ref.current;

    element.addEventListener("change", cb);

    return () => {
      element.removeEventListener("change", cb);
    };
  }, [defaultValueHex, onConfirm]);

  const onChangeHandler: FormEventHandler<HTMLInputElement> = (e) => {
    if (e.target instanceof HTMLInputElement) {
      onChange(e.target.value);
    }
  };

  return (
    <input
      data-testid={`color-${defaultValue}`}
      id={name}
      type="color"
      className="h-7 w-7 rounded-md bg-neutral-700 p-[3px] outline-none [color-scheme:dark]"
      defaultValue={defaultValueHex}
      onChange={onChangeHandler}
      ref={ref}
    />
  );
}
