/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { type ActionIdSafe } from "@triplex/ux";
import { createContext, useContext, useReducer } from "react";
import { Pressable } from "./pressable";

const ExpandedContext = createContext(true);
const ToggleContext = createContext(() => {});

function toggleReducer(value: boolean) {
  return !value;
}

export function Root({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setExpanded] = useReducer(toggleReducer, defaultExpanded);

  return (
    <ToggleContext.Provider value={setExpanded}>
      <ExpandedContext.Provider value={isExpanded}>
        <div>{children}</div>
      </ExpandedContext.Provider>
    </ToggleContext.Provider>
  );
}

export function Trigger({
  actionId,
  children,
}: {
  actionId: ActionIdSafe;
  children: string;
}) {
  const isExpanded = useContext(ExpandedContext);
  const toggle = useContext(ToggleContext);

  return (
    <Pressable
      actionId={actionId}
      className="bg-editor sticky top-0 z-[1] flex w-full gap-0.5 pb-1.5 pt-1.5 text-[11px] font-semibold uppercase"
      onClick={toggle}
    >
      {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
      {children}
    </Pressable>
  );
}

export function Content({
  children,
  forcedExpanded,
}: {
  children: React.ReactNode;
  forcedExpanded?: boolean;
}) {
  const isExpanded = useContext(ExpandedContext);

  return (
    <div className="-mt-1.5 px-1">
      {(isExpanded || forcedExpanded) && children}
    </div>
  );
}
