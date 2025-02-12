/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { EraserIcon } from "@radix-ui/react-icons";
import { send } from "@triplex/bridge/host";
import { PropInput } from "@triplex/ux/inputs";
import { useReducer } from "react";
import * as Accordion from "../../components/accordion";
import { IconButton } from "../../components/button";
import { preloadSubscription, useLazySubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-props";
import { propsByGroup } from "../element-props/group";
import { renderPropInputs } from "./inputs";

function ProviderProps() {
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    exportName: "default",
    path: window.triplex.env.config.provider,
  });
  const props = data.props.filter((prop) => prop.name !== "children");
  const [resetKey, resetForm] = useReducer((val: number) => val + 1, 0);
  const groupsDef = useLazySubscription("/prop-groups-def");
  const groupedProps = propsByGroup(props, { groupsDef });
  const filter = useFilter((state) => state.filter);
  const setFilter = useFilter((state) => state.set);

  return (
    <>
      {props.length === 0 && <LearnToUseCTA />}

      {props.length > 0 && (
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
          <IconButton
            actionId="contextpanel_provider_reset"
            icon={EraserIcon}
            label="Reset Provider Props"
            onClick={() => {
              props.forEach((prop) => {
                send("request-reset-prop", {
                  column: -999,
                  line: -999,
                  path: window.triplex.env.config.provider,
                  propName: prop.name,
                });
              });
              resetForm();
            }}
            spacing="spacious"
          />
        </div>
      )}

      <div className="flex flex-col px-1.5" key={resetKey}>
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

                return (
                  <PropInput
                    key={prop.name}
                    onChange={(propValue) => {
                      send("request-set-element-prop", {
                        column: -999,
                        line: -999,
                        path: window.triplex.env.config.provider,
                        propName: prop.name,
                        propValue,
                      });
                    }}
                    onConfirm={() => {}}
                    path={window.triplex.env.config.provider}
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

function LearnToUseCTA() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <strong>Provider Controls</strong>
      <span className="text-xs text-neutral-400">
        Props declared on your provider component will appear here to configure.
      </span>
      <a
        className="text-link focus-visible:outline-selected focus:outline-[transparent]"
        href="https://triplex.dev/docs/guides/provider-controls"
      >
        Learn how to use this feature.
      </a>
    </div>
  );
}

function SetUpCTA() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <strong>Provider Controls</strong>
      Set up a provider component and its props will appear here to configure.
      <div>
        <a
          className="text-link focus-visible:outline-selected focus:outline-[transparent]"
          href="https://triplex.dev/docs/guides/provider-controls"
        >
          Learn how to set one up.
        </a>
      </div>
    </div>
  );
}

export function ProviderControlsPanel() {
  const isProviderSetUp =
    window.triplex.env.config.provider &&
    window.triplex.env.config.provider !== "triplex:empty-provider.jsx";

  return <>{isProviderSetUp ? <ProviderProps /> : <SetUpCTA />}</>;
}

preloadSubscription("/scene/:path/:exportName/props", {
  exportName: "default",
  path: window.triplex.env.config.provider,
});
