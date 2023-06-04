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

function isAnyRequiredValueUndefined(
  valueDef: ArrayProp["value"],
  nextValues: unknown[]
) {
  for (let i = 0; i < nextValues.length; i++) {
    const value = nextValues[i];
    const isUndefinedOrEmptyString =
      typeof value === "undefined" || value === "";

    if (isUndefinedOrEmptyString && valueDef[i].required) {
      return true;
    }
  }

  return false;
}

function dropUnneededOptionalValues(
  valueDef: ArrayProp["value"],
  nextValues: unknown[]
) {
  const clearedValues: unknown[] = [];

  let foundDefinedValue = false;

  for (let i = nextValues.length - 1; i >= 0; i--) {
    const value = nextValues[i];
    const isUndefinedOrEmptyString =
      typeof value === "undefined" || value === "";

    if (
      !foundDefinedValue &&
      isUndefinedOrEmptyString &&
      !valueDef[i].required
    ) {
      // While we haven't found any defined values, we can skip undefined optional ones
    } else {
      foundDefinedValue = true;
      clearedValues.unshift(value);
    }
  }

  return clearedValues;
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

          if (isAnyRequiredValueUndefined(values, nextValue)) {
            return;
          }

          onChange(dropUnneededOptionalValues(values, nextValue));
        };

        const onConfirmHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const currentValue: unknown[] = values.map(reduceValue);
          const nextValue = merge(currentValue, intermediateValues.current);

          if (isAnyRequiredValueUndefined(values, nextValue)) {
            return;
          }

          onConfirm(dropUnneededOptionalValues(values, nextValue));
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
