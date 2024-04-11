/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { TupleType } from "@triplex/server";
import { useRef } from "react";
import { useAnalytics, type ActionIdSafe } from "../analytics";
import { PropInput } from "./prop-input";

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
  nextValue: unknown[]
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

function dropUnneededOptionalValues(
  valueDef: TupleType["shape"],
  nextValues: unknown[]
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

  return clearedValues;
}

export function TupleInput({
  actionId,
  column,
  line,
  name,
  onChange,
  onConfirm,
  path,
  testId,
  value,
  values,
}: {
  actionId: ActionIdSafe;
  column?: number;
  line?: number;
  name: string;
  onChange: (value: unknown[]) => void;
  onConfirm: (value: unknown[]) => void;
  path: string;
  required?: boolean;
  testId?: string;
  value: unknown[] | unknown;
  values: TupleType["shape"];
}) {
  const defaultValue = Array.isArray(value) ? value : [value];
  const intermediateValues = useRef<Record<string, unknown>>({});
  const analytics = useAnalytics();

  return (
    <>
      {values.map((val, index) => {
        const onChangeHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const nextValue = merge(defaultValue, intermediateValues.current);

          if (isAnyRequiredValueUndefined(values, nextValue)) {
            return;
          }

          onChange(dropUnneededOptionalValues(values, nextValue));
        };

        const onConfirmHandler = (value: unknown) => {
          intermediateValues.current[index] = value;

          const nextValue = merge(defaultValue, intermediateValues.current);

          if (isAnyRequiredValueUndefined(values, nextValue)) {
            return;
          }

          onConfirm(dropUnneededOptionalValues(values, nextValue));
          intermediateValues.current = {};
          analytics.event(`${actionId}_confirm`);
        };

        return (
          <PropInput
            column={column}
            key={index}
            line={line}
            name={name + index}
            onChange={onChangeHandler}
            onConfirm={onConfirmHandler}
            path={path}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            prop={{ ...val, value: defaultValue[index] as string } as any}
            required={"required" in val ? val.required : false}
            testId={testId ? `${testId}[${index}]` : undefined}
          />
        );
      })}
    </>
  );
}
