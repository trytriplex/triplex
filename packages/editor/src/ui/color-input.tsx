import { FormEventHandler, useEffect, useRef, useState } from "react";
import tinycolor from "tinycolor2";

export function ColorInput({
  defaultValue,
  name,
  onConfirm,
  onChange,
}: {
  defaultValue?: string;
  name: string;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const defaultValueHex = defaultValue
    ? tinycolor(defaultValue).toHexString()
    : undefined;
  const [hasChanged, setHasChanged] = useState(false);

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
      setHasChanged(true);
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative h-7 w-7">
      {!defaultValueHex && !hasChanged && (
        <div className="bg-checker pointer-events-none absolute inset-[3px] rounded-[3px] text-neutral-600 [background-size:20px]" />
      )}
      <input
        data-testid={`color-${defaultValue}`}
        id={name}
        type="color"
        className="h-7 w-7 rounded-md bg-neutral-700 p-[3px] outline-none [color-scheme:dark]"
        defaultValue={defaultValueHex}
        onChange={onChangeHandler}
        ref={ref}
      />
    </div>
  );
}
