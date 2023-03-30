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
}: {
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
    <div className="flex gap-1">
      <div className="flex flex-col gap-1">
        <PropInput
          name={name}
          onChange={onChange}
          onConfirm={onConfirm}
          path={path}
          prop={value}
        />
      </div>
      <IconButton
        icon={SwitchIcon}
        title="Switch prop type"
        onClick={incrementIndex}
      />
    </div>
  );
}
