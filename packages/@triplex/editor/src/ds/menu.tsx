/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Content,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Trigger,
} from "@radix-ui/react-dropdown-menu";
import { DotFilledIcon } from "@radix-ui/react-icons";
import React, { createContext, useContext } from "react";
import { cn } from "./cn";
import { PrimitiveProvider } from "./pressable";

export function Menu({
  children,
  trigger,
}: {
  children: React.ReactNode;
  trigger: JSX.Element;
}) {
  return (
    <Root>
      <Trigger asChild>
        <PrimitiveProvider>{trigger}</PrimitiveProvider>
      </Trigger>
      <Portal>
        <Content
          align="center"
          className="mt-2 rounded border border-neutral-800 bg-neutral-900 p-1"
        >
          {children}
        </Content>
      </Portal>
    </Root>
  );
}

const RadioGroupContext = createContext("");

export function MenuRadioGroup<TValue extends string>({
  children,
  onChange,
  value,
}: {
  children: React.ReactNode;
  onChange: (value: TValue) => void;
  value: TValue;
}) {
  return (
    <RadioGroup onValueChange={onChange as () => void} value={value}>
      <RadioGroupContext.Provider value={value}>
        {children}
      </RadioGroupContext.Provider>
    </RadioGroup>
  );
}

export function MenuRadioItem<TValue extends string>({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TValue;
}) {
  const selectedValue = useContext(RadioGroupContext);
  const isSelected = value === selectedValue;

  return (
    <RadioItem
      className={cn([
        "relative flex select-none items-center gap-1 rounded px-2 py-1 text-sm outline-none outline-1 outline-offset-0 data-[highlighted]:outline-blue-400 data-[highlighted]:hover:outline-none",
        isSelected ? "bg-white/5" : "hover:bg-white/5 active:bg-white/10",
      ])}
      value={value}
    >
      {isSelected ? (
        <DotFilledIcon className="-ml-1 text-blue-400" />
      ) : (
        <span className="w-3" />
      )}
      <span className={isSelected ? "text-blue-400" : "text-neutral-300"}>
        {children}
      </span>
    </RadioItem>
  );
}
