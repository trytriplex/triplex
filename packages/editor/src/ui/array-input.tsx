import { useRef } from "react";
import { ArrayProp, Prop } from "../api-types";
import { PropInput } from "./prop-input";

function reduceValue(value: Prop): string | number | boolean | undefined {
  if (Array.isArray(value.value)) {
    return reduceValue(value.value[0]);
  }

  return value.value;
}

function merge(a: unknown[], b: Record<string, unknown>) {
  const c = [...a];

  for (const key in b) {
    const index = Number(key);
    if (Number.isNaN(index)) {
      throw new Error("invariant");
    }

    c[index] = b[index];
  }

  return c;
}

export function ArrayInput({
  values,
  path,
  name,
  column,
  line,
  onChange,
  onConfirm,
}: {
  required?: boolean;
  values: ArrayProp["value"];
  name: string;
  path: string;
  column?: number;
  line?: number;
  onChange: (value: unknown[]) => void;
  onConfirm: (value: unknown[]) => void;
}) {
  const isUnhandled = !!values.find((val) => val.type === "unhandled");
  const intermediateValues = useRef<Record<string, unknown>>({});

  return (
    <>
      {values.map((val, index) => {
        const onChangeHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const currentValue: unknown[] = values.map(reduceValue);
          const nextValue = merge(currentValue, intermediateValues.current);

          if (val.required && nextValue.includes(undefined)) {
            return;
          }

          onChange(nextValue);
        };

        const onConfirmHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const currentValue: unknown[] = values.map(reduceValue);
          const nextValue = merge(currentValue, intermediateValues.current);

          if (val.required && nextValue.includes(undefined)) {
            return;
          }

          onConfirm(nextValue);
          intermediateValues.current = {};
        };

        return (
          <PropInput
            required={val.required}
            path={path}
            key={index}
            onChange={onChangeHandler}
            onConfirm={onConfirmHandler}
            column={column}
            line={line}
            name={name + index}
            prop={
              isUnhandled ? { type: "unhandled", value: `${val.value}` } : val
            }
          />
        );
      })}
    </>
  );
}
