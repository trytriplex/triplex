/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { EraserIcon } from "@radix-ui/react-icons";
import { send } from "@triplex/bridge/host";
import { PropInput } from "@triplex/ux/inputs";
import { useReducer } from "react";
import * as Accordion from "../../components/accordion";
import { IconButton } from "../../components/button";
import { useLazySubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-props";
import { sendVSCE } from "../../util/bridge";
import { useSceneSelected } from "../app-root/context";
import { type SceneSelected } from "../app-root/types";
import { propsByGroup } from "../element-props/group";
import { renderPropInputs } from "./inputs";

export function SelectionPanel() {
  const selected = useSceneSelected();

  return selected ? <SelectionPanelLoadable selected={selected} /> : null;
}

function LearnToUseCTA({ exportName }: { exportName: string }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <strong>Component Controls</strong>
      <span>
        {`Props declared on ${exportName} will appear here that can be temporarily
        set.`}
      </span>
      <a
        className="text-link focus-visible:outline-selected focus:outline-[transparent]"
        href="https://triplex.dev/docs/guides/component-controls"
      >
        Learn how to use this feature.
      </a>
    </div>
  );
}

function NoPropsCTA() {
  return <div className="px-4 py-3 italic">This element has no props.</div>;
}

function SelectionPanelLoadable({ selected }: { selected: SceneSelected }) {
  const filter = useFilter((state) => state.filter);
  const setFilter = useFilter((state) => state.set);
  const isPropsForComponent = "exportName" in selected;
  const formKey = isPropsForComponent
    ? `${selected.path}${selected.exportName}`
    : `${selected.path}${selected.column}${selected.line}`;
  const [resetKey, resetForm] = useReducer((val: number) => val + 1, 0);
  const props = useLazySubscription(
    isPropsForComponent
      ? "/scene/:path/:exportName/props"
      : "/scene/:path/object/:line/:column",
    selected,
  );
  const hasProps = props.props.length > 0;
  const groupsDef = useLazySubscription("/prop-groups-def");
  const groupedProps = propsByGroup(props.props, {
    expandAll: isPropsForComponent,
    groupsDef,
  });

  return (
    <>
      {hasProps && (
        <div className="flex gap-1 p-1.5">
          <input
            className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
            onChange={(e) => {
              setFilter(e.currentTarget.value);
            }}
            onFocus={(e) => e.stopPropagation()}
            placeholder="Filter props..."
            value={filter}
          />
          {isPropsForComponent && (
            <IconButton
              actionId="contextpanel_provider_reset"
              icon={EraserIcon}
              label="Reset Component Props"
              onClick={() => {
                props.props.forEach((prop) => {
                  send("request-reset-prop", {
                    column: -1,
                    line: -1,
                    path: selected.path,
                    propName: prop.name,
                  });
                });
                resetForm();
              }}
            />
          )}
        </div>
      )}

      {!hasProps && isPropsForComponent && (
        <LearnToUseCTA exportName={selected.exportName} />
      )}

      {!hasProps && !isPropsForComponent && <NoPropsCTA />}

      <div className="flex flex-col px-1.5" key={`${resetKey}${formKey}`}>
        {groupedProps.map((group) => (
          <Accordion.Root
            defaultExpanded={group.defaultExpanded}
            key={group.name}
          >
            <Accordion.Trigger actionId="scenepanel_element_togglepropgroup">
              {group.name}
            </Accordion.Trigger>
            <Accordion.Content forcedExpanded={!!filter}>
              {group.props.map((prop) => {
                if (
                  !prop.name.toLowerCase().includes(filter?.toLowerCase() || "")
                ) {
                  return null;
                }

                const fieldKey = isPropsForComponent
                  ? `${prop.name}${selected.exportName}`
                  : `${prop.name}${selected.column}${selected.line}`;

                return (
                  <PropInput
                    key={fieldKey}
                    onChange={(propValue) => {
                      send("request-set-element-prop", {
                        ...(isPropsForComponent
                          ? { column: -1, line: -1, path: selected.path }
                          : selected),
                        propName: prop.name,
                        propValue,
                      });
                    }}
                    onConfirm={(propValue) => {
                      if (isPropsForComponent) {
                        // Bail out as this isn't a persistent element.
                        return;
                      }
                      sendVSCE("element-set-prop", {
                        ...selected,
                        propName: prop.name,
                        propValue,
                      });
                    }}
                    path={
                      isPropsForComponent ? selected.path : selected.parentPath
                    }
                    prop={prop}
                  >
                    {renderPropInputs}
                  </PropInput>
                );
              })}
            </Accordion.Content>
          </Accordion.Root>
        ))}
      </div>
    </>
  );
}
