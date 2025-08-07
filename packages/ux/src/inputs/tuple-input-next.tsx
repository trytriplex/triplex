/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { equal } from "@triplex/lib";
import type { TupleType } from "@triplex/lib/types";
import { useLayoutEffect, useState } from "react";
import { PropInput } from "./prop-input";
import { type RenderInputs } from "./types";

const NO_VALUE_SET = Symbol("NO_VALUE_SET");

function isUndefinedOrEmptyStringValue(value: unknown) {
  return value === undefined || value === "";
}

function isAnyRequiredValueUndefined(
  tupleTypes: TupleType["shape"],
  nextValue: unknown[],
) {
  for (let i = 0; i < tupleTypes.length; i++) {
    const type = tupleTypes[i];
    const value = nextValue[i];
    const isUndefinedOrEmptyString = isUndefinedOrEmptyStringValue(value);

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
    const isUndefinedOrEmptyString = isUndefinedOrEmptyStringValue(value);
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
    const isUndefinedOrEmptyString = isUndefinedOrEmptyStringValue(value);
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

  if (
    !required &&
    clearedValues.filter((value) => !isUndefinedOrEmptyStringValue(value))
      .length === 0
  ) {
    return undefined;
  }

  return clearedValues;
}

function setRequiredUndefinedValues(
  { propName, types }: { propName?: string; types: TupleType["shape"] },
  nextValue: unknown[],
) {
  const values = [...nextValue];

  for (let i = 0; i < types.length; i++) {
    const value = values[i];
    const type = types[i];
    if (value === undefined && type.kind === "number" && type.required) {
      values[i] = propName?.includes("scale") ? 1 : 0;
    }
  }

  return values;
}

function resolveNextValue({
  index,
  prevValue = [],
  propName,
  required,
  value,
  values,
}: {
  index: number;
  prevValue: unknown[] | undefined;
  propName?: string;
  required: boolean;
  value: unknown;
  values: TupleType["shape"];
}): { nextValue: unknown[] | undefined; state: "valid" | "invalid" } {
  const currentValue = [...prevValue];
  currentValue[index] = value;

  const stagedValue = setRequiredUndefinedValues(
    { propName, types: values },
    currentValue,
  );
  const allValuesUndefined = areAllValuesUndefined(values, stagedValue);
  const someRequiredValueUndefined = isAnyRequiredValueUndefined(
    values,
    stagedValue,
  );

  if (allValuesUndefined && !required) {
    // Continue to event handler.
  } else if (someRequiredValueUndefined) {
    // Return early all values that are required must be defined.
    return {
      nextValue: stagedValue,
      state: "invalid",
    } as const;
  }

  const nextValue = dropUnneededOptionalValues(values, stagedValue, required);

  return {
    nextValue,
    state: "valid",
  } as const;
}

export function TupleInput({
  children,
  defaultValue,
  onChange,
  onConfirm,
  path,
  persistedValue: _persistedValue = defaultValue,
  propName,
  required = false,
  values,
}: {
  children: RenderInputs;
  defaultValue?: unknown[];
  onChange: (value: unknown[] | undefined) => void;
  onConfirm: (value: unknown[] | undefined) => void;
  path: string;
  persistedValue: unknown[] | unknown | undefined;
  propName?: string;
  required?: boolean;
  values: TupleType["shape"];
}) {
  const persistedValue = Array.isArray(_persistedValue)
    ? _persistedValue
    : [_persistedValue];
  const [stagedPersistedValue, setTempPersistedValue] = useState<
    unknown[] | undefined | typeof NO_VALUE_SET
  >(NO_VALUE_SET);
  const [respectRequiredProp, setRespectRequiredProp] = useState(required);
  const valueArr =
    stagedPersistedValue === NO_VALUE_SET
      ? persistedValue
      : (stagedPersistedValue ?? persistedValue);

  useLayoutEffect(() => {
    // Re-set respecting the required prop if default / persisted / required props change.
    setRespectRequiredProp(required);
  }, [defaultValue, _persistedValue, required]);

  useLayoutEffect(() => {
    // If the actual persisted value changes we need to clear the temp values.
    setTempPersistedValue(NO_VALUE_SET);
  }, [_persistedValue]);

  return (
    <>
      {values.map((val, index) => {
        const onChangeHandler = (value: unknown) => {
          setTempPersistedValue((prevValue) => {
            const actualPrevValue =
              prevValue === NO_VALUE_SET ? persistedValue : prevValue;

            const { nextValue, state } = resolveNextValue({
              index,
              prevValue: actualPrevValue,
              propName,
              required,
              value,
              values,
            });

            setRespectRequiredProp(state !== "valid");

            if (state === "valid") {
              onChange(nextValue);
            }

            return nextValue;
          });
        };

        const onConfirmHandler = (value: unknown) => {
          setTempPersistedValue((prevValue) => {
            const actualPrevValue =
              prevValue === NO_VALUE_SET ? persistedValue : prevValue;

            const { nextValue, state } = resolveNextValue({
              index,
              prevValue: actualPrevValue,
              propName,
              required,
              value,
              values,
            });

            setRespectRequiredProp(state !== "valid");

            if (state === "valid" && !equal(nextValue, persistedValue)) {
              onConfirm(nextValue);
            }

            return nextValue;
          });
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
