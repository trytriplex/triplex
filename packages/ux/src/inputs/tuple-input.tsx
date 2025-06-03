/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import type { TupleType } from "@triplex/lib/types";
import { useLayoutEffect, useRef, useState } from "react";
import { PropInput } from "./prop-input";
import { type RenderInputs } from "./types";

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
  tupleTypes: TupleType["shape"],
  nextValue: unknown[],
) {
  for (let i = 0; i < tupleTypes.length; i++) {
    const type = tupleTypes[i];
    const value = nextValue[i];
    const isUndefinedOrEmptyString = value === undefined || value === "";

    if (isUndefinedOrEmptyString && "required" in type && type.required) {
      return true;
    }
  }

  return false;
}

function areAllValuesUndefined(
  tupleTypes: TupleType["shape"],
  nextValue: unknown[],
) {
  let allUndefined = true;

  for (let i = 0; i < tupleTypes.length; i++) {
    const value = nextValue[i];
    const isUndefinedOrEmptyString = value === undefined || value === "";
    if (!isUndefinedOrEmptyString) {
      allUndefined = false;
    }
  }

  return allUndefined;
}

function dropUnneededOptionalValues(
  valueDef: TupleType["shape"],
  nextValues: unknown[],
  required: boolean,
) {
  const clearedValues: unknown[] = [];

  let foundDefinedValue = false;

  for (let i = nextValues.length - 1; i >= 0; i--) {
    const value = nextValues[i];
    const isUndefinedOrEmptyString = value === undefined || value === "";
    const type = valueDef[i];

    if (
      !foundDefinedValue &&
      isUndefinedOrEmptyString &&
      ("required" in type ? !type.required : true)
    ) {
      // While we haven't found any defined values, we can skip undefined optional ones
    } else {
      foundDefinedValue = true;
      clearedValues.unshift(value);
    }
  }

  if (!required && clearedValues.filter(Boolean).length === 0) {
    return undefined;
  }

  return clearedValues;
}

export function TupleInput({
  children,
  defaultValue,
  onChange,
  onConfirm,
  path,
  persistedValue,
  required = false,
  values,
}: {
  children: RenderInputs;
  defaultValue?: unknown[];
  onChange: (value: unknown[] | undefined) => void;
  onConfirm: (value: unknown[] | undefined) => void;
  path: string;
  persistedValue: unknown[] | unknown | undefined;
  required?: boolean;
  values: TupleType["shape"];
}) {
  const initialValue = persistedValue ?? defaultValue;
  const valueArr = Array.isArray(initialValue) ? initialValue : [initialValue];
  const intermediateValues = useRef<Record<string, unknown>>({});
  const [respectRequiredProp, setRespectRequiredProp] = useState(required);

  useLayoutEffect(() => {
    // Re-set respecting the required prop if default / persisted / required props change.
    setRespectRequiredProp(required);
  }, [defaultValue, persistedValue, required]);

  return (
    <>
      {values.map((val, index) => {
        const onChangeHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const nextValue = merge(valueArr, intermediateValues.current);

          const allValuesUndefined = areAllValuesUndefined(values, nextValue);
          const someRequiredValueUndefined = isAnyRequiredValueUndefined(
            values,
            nextValue,
          );

          if (allValuesUndefined && !required) {
            // Continue to event handler.
            setRespectRequiredProp(false);
          } else if (someRequiredValueUndefined) {
            // Return early all values that are required must be defined.
            setRespectRequiredProp(true);
            return;
          }

          onChange(dropUnneededOptionalValues(values, nextValue, required));
        };

        const onConfirmHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const nextValue = merge(valueArr, intermediateValues.current);

          const allValuesUndefined = areAllValuesUndefined(values, nextValue);
          const someRequiredValueUndefined = isAnyRequiredValueUndefined(
            values,
            nextValue,
          );

          if (allValuesUndefined && !required) {
            // Continue to event handler.
          } else if (someRequiredValueUndefined) {
            // Return early all values that are required must be defined.
            return;
          }

          onConfirm(dropUnneededOptionalValues(values, nextValue, required));
          intermediateValues.current = {};
        };

        return (
          <PropInput
            key={index}
            onChange={onChangeHandler}
            onConfirm={onConfirmHandler}
            path={path}
            prop={
              {
                ...val,
                ...(respectRequiredProp ? {} : { required: false }),
                value: valueArr[index] as string,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any
            }
          >
            {children}
          </PropInput>
        );
      })}
    </>
  );
}
