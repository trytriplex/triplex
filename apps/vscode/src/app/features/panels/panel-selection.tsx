/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/host";
import { cn } from "@triplex/lib";
import { PropInput } from "@triplex/ux/inputs";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useDeferredValue, useEffect, useRef } from "react";
import { ScrollContainer } from "../../components/scroll-container";
import { useLazySubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-props";
import { useSceneStore, type ElementLocation } from "../../stores/scene";
import { sendVSCE } from "../../util/bridge";
import { renderPropInputs } from "./inputs";

export function SelectionPanel() {
  const selected = useSceneStore((store) => store.selected);

  return selected ? <SelectionPanelLoadable selected={selected} /> : null;
}

function SelectionPanelLoadable({
  selected: inSelected,
}: {
  selected: ElementLocation;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selected = useDeferredValue(inSelected);
  const filter = useFilter((state) => state.filter);
  const setFilter = useFilter((state) => state.set);
  const props = useLazySubscription(
    "/scene/:path/object/:line/:column",
    selected,
  );

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "start" });
  }, [selected]);

  return (
    <ScrollContainer className="border-overlay border-t">
      <div className="flex p-1.5" ref={ref}>
        <VSCodeTextField
          className={cn([!filter && "opacity-70", "w-full focus:opacity-100"])}
          onFocus={(e) => e.stopPropagation()}
          onInput={(e) => {
            if (e.currentTarget && "value" in e.currentTarget) {
              setFilter(e.currentTarget.value as string);
            }
          }}
          placeholder="Filter props..."
          value={filter}
        />
      </div>
      <div className="flex flex-col gap-1 px-1.5">
        {props.props.map((prop) => {
          if (!prop.name.toLowerCase().includes(filter?.toLowerCase() || "")) {
            return null;
          }

          return (
            <PropInput
              key={selected.path + prop.name + selected.column + selected.line}
              onChange={(propValue) => {
                send("request-set-element-prop", {
                  ...selected,
                  propName: prop.name,
                  propValue,
                });
              }}
              onConfirm={(propValue) => {
                sendVSCE("element-set-prop", {
                  ...selected,
                  propName: prop.name,
                  propValue,
                });
              }}
              prop={prop}
            >
              {renderPropInputs}
            </PropInput>
          );
        })}
      </div>
    </ScrollContainer>
  );
}
