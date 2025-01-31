/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  createContext,
  useContext,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { useTelemetry, type ActionId } from "./telemetry";

const MenuIdContext = createContext("");

export function Menu({
  children,
  onSelect,
}: {
  children: [trigger: ReactNode, ...options: ReactNode[]];
  onSelect?: (value: string) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLSelectElement>(null!);
  const telemetry = useTelemetry();

  return (
    <div
      style={{
        alignItems: "center",
        display: "inline-flex",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <select
        className="peer"
        id={id}
        onChange={(e) => {
          onSelect?.(e.target.value);
          const optionActionid = e.target.options
            .item(e.target.selectedIndex)
            ?.getAttribute("data-actionid");
          if (optionActionid) {
            telemetry.event(optionActionid as ActionId);
          }
        }}
        ref={ref}
        style={{
          cursor: "pointer",
          inset: 0,
          opacity: 0,
          position: "absolute",
        }}
        value={""}
      >
        <hr />
        <option hidden value="" />
        {children.slice(1)}
      </select>
      <MenuIdContext.Provider value={id}>{children[0]}</MenuIdContext.Provider>
    </div>
  );
}

export function MenuTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const id = useContext(MenuIdContext);
  return (
    <label
      className={className}
      htmlFor={id}
      // @ts-expect-error — Should be fixed with react@19 types.
      inert="true"
      style={{ display: "flex" }}
    >
      {children}
    </label>
  );
}

export function MenuOption({
  actionId,
  children,
  value,
}: {
  actionId: ActionId;
  children: ReactNode;
  value: string;
}) {
  return (
    <option data-actionid={actionId} key={value} value={value}>
      {children}
    </option>
  );
}

export function MenuSeparator() {
  return <hr />;
}
