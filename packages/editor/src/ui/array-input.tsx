import type { ArrayProp } from "./prop-input";
import { PropInput } from "./prop-input";

export function ArrayInput({
  values,
  path,
  name,
  column,
  line,
  onChange,
  onConfirm,
}: {
  values: ArrayProp["value"];
  name: string;
  path: string;
  column: number;
  line: number;
  onChange: (value: unknown[]) => void;
  onConfirm: (value: unknown[]) => void;
}) {
  const isUnhandled = !!values.find((val) => val.type === "unhandled");

  return (
    <>
      {values.map((val, index) => {
        const onChangeHandler = (value: unknown) => {
          const currentValue: unknown[] = values.map((val) => val.value);
          currentValue[index] = value;
          onChange(currentValue);
        };

        const onConfirmHandler = (value: unknown) => {
          const currentValue: unknown[] = values.map((val) => val.value);
          currentValue[index] = value;
          onConfirm(currentValue);
        };

        return (
          <PropInput
            path={path}
            key={index}
            onChange={onChangeHandler}
            onConfirm={onConfirmHandler}
            prop={{
              column,
              line,
              name: name + index,
              type: isUnhandled ? "unhandled" : val.type,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value: val.value as any,
            }}
          />
        );
      })}
    </>
  );
}
