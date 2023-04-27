import { ArrayProp, Prop } from "../api-types";
import { PropInput } from "./prop-input";

function reduceValue(value: Prop): string | number | boolean | undefined {
  if (Array.isArray(value.value)) {
    return reduceValue(value.value[0]);
  }

  return value.value;
}

export function ArrayInput({
  values,
  path,
  name,
  column,
  line,
  onChange,
  onConfirm,
  required,
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

  return (
    <>
      {values.map((val, index) => {
        const onChangeHandler = (value: unknown) => {
          const currentValue: unknown[] = values.map(reduceValue);
          currentValue[index] = value;
          onChange(currentValue);
        };

        const onConfirmHandler = (value: unknown) => {
          const currentValue: unknown[] = values.map(reduceValue);
          currentValue[index] = value;
          onConfirm(currentValue);
        };

        return (
          <PropInput
            required={"required" in val ? val.required : required}
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
