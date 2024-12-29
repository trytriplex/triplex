/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { send } from "@triplex/bridge/host";
import { useLayoutEffect, useReducer, useRef } from "react";
import { IconButton } from "../../components/button";
import { useFilter } from "../../stores/filter-elements";
import { useSceneStore } from "../../stores/scene";
import { SceneElements } from "./element";

export function FilterElements() {
  const setFilter = useFilter((state) => state.set);
  const filter = useFilter((state) => state.filter);
  const [focused, toggleFocused] = useReducer((state) => !state, false);
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (focused) {
      ref.current?.focus();
    }
  }, [focused]);

  if (!focused) {
    return (
      <IconButton
        actionId="scenepanel_elements_filter"
        icon={MagnifyingGlassIcon}
        isSelected={!!filter}
        label="Filter Elements"
        onClick={toggleFocused}
        spacing="spacious"
      />
    );
  }

  return (
    <div className="bg-editor absolute inset-0 p-1.5">
      <input
        aria-label="Filter elements"
        className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
        onBlur={toggleFocused}
        onChange={(e) => {
          setFilter(e.currentTarget.value);
        }}
        onFocus={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            toggleFocused();
            setFilter("");
            e.stopPropagation();
          } else if (e.key === "Enter") {
            toggleFocused();
          }
        }}
        placeholder="Filter elements..."
        ref={ref}
        value={filter}
      />
    </div>
  );
}

export function ElementsPanel() {
  const context = useSceneStore((store) => store.context);

  return (
    <ul onMouseLeave={() => send("element-hint", null)}>
      <SceneElements exportName={context.exportName} path={context.path} />
    </ul>
  );
}
