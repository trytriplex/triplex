import { useState } from "react";
import { SwitchIcon } from "@radix-ui/react-icons";
import { PropInput } from "./prop-input";
import { IconButton } from "../ds/button";
import { Prop } from "../api-types";

export function UnionInput({
  values,
  name,
  onChange,
  onConfirm,
  path,
  defaultValue,
  required,
  line,
  column,
}: {
  line?: number;
  column?: number;
  required?: boolean;
  defaultValue?: string | number;
  path: string;
  name: string;
  values: Prop[];
  onChange: (value: unknown) => void;
  onConfirm: (value: unknown) => void;
}) {
  const [index, setIndex] = useState(0);
  const value = values[index % values.length];
  const incrementIndex = () => {
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col gap-1">
        <PropInput
          required={required}
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          path={path}
          line={line}
          column={column}
          prop={Object.assign(
            {},
            value,
            defaultValue ? { value: defaultValue } : {}
          )}
        />
      </div>
      <div>
        <IconButton
          icon={SwitchIcon}
          title="Switch prop type"
          onClick={incrementIndex}
        />
      </div>
    </div>
  );
}
