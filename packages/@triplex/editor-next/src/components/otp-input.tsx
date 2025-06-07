/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { cn } from "@triplex/lib";

function OTPFakeInput({ index, value }: { index: number; value: string }) {
  const isLastInputFilled = value.length === 6 && index === 5;

  return (
    <div
      className={cn([
        (value.length === index || isLastInputFilled) &&
          "peer-focus:border-selected",
        "bg-input text-default peer-disabled:text-disabled border-input text-heading pointer-events-auto flex h-10 w-10 cursor-text items-center justify-center rounded-sm border font-medium peer-disabled:cursor-not-allowed",
      ])}
    >
      {value[index]}
    </div>
  );
}

export function OTPInput({
  isDisabled,
  name,
  onChange,
  value,
}: {
  isDisabled?: boolean;
  name: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="pointer-events-none flex justify-between py-1">
      <input
        autoFocus
        className="peer sr-only"
        disabled={isDisabled}
        maxLength={6}
        minLength={6}
        name={name}
        onChange={(e) => onChange(e.target.value)}
        required
        type="number"
        value={value}
      />
      <OTPFakeInput index={0} value={value} />
      <OTPFakeInput index={1} value={value} />
      <OTPFakeInput index={2} value={value} />
      <OTPFakeInput index={3} value={value} />
      <OTPFakeInput index={4} value={value} />
      <OTPFakeInput index={5} value={value} />
    </label>
  );
}
