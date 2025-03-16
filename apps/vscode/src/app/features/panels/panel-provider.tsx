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
import { preloadSubscription, useSubscription } from "../../hooks/ws";
import { useFilter } from "../../stores/filter-props";
import { createCodeLink } from "../../util/commands";
import { renderPropInputs } from "./inputs";

function ProviderProps() {
  const [globalProvider, canvasProvider, deprecatedCanvasProvider] =
    useSubscription(
      "/scene/:path/:exportName{/:exportName1}{/:exportName2}/props",
      {
        exportName: "GlobalProvider",
        exportName1: "CanvasProvider",
        exportName2: "default",
        path: window.triplex.env.config.provider,
      },
    );
  const [resetKey, resetForm] = useReducer((val: number) => val + 1, 0);
  const filter = useFilter((state) => state.filter);
  const setFilter = useFilter((state) => state.set);

  const providerPropGroups = [
    {
      column: -888,
      exportName: "GlobalProvider",
      line: -888,
      message: "",
      name: "Global Provider",
      props: globalProvider?.props.filter((prop) => prop.name !== "children"),
      reset: () => {
        const props = globalProvider?.props;
        props?.forEach((prop) => {
          send("request-reset-prop", {
            column: -888,
            line: -888,
            path: window.triplex.env.config.provider,
            propName: prop.name,
          });
        });
      },
    },
    {
      column: -999,
      exportName: "CanvasProvider",
      line: -999,
      message: deprecatedCanvasProvider ? (
        <>
          The default export is deprecated. Export as "CanvasProvider" to remove
          this message.
          <br />
          <a
            className="text-link cursor-pointer not-italic underline focus:outline-none"
            href={createCodeLink(window.triplex.env.config.provider)}
          >
            Go to providers.
          </a>
        </>
      ) : (
        ""
      ),
      name: "Canvas Provider",
      props: (canvasProvider || deprecatedCanvasProvider)?.props.filter(
        (prop) => prop.name !== "children",
      ),
      reset: () => {
        const props = (canvasProvider || deprecatedCanvasProvider)?.props;
        props?.forEach((prop) => {
          send("request-reset-prop", {
            column: -999,
            line: -999,
            path: window.triplex.env.config.provider,
            propName: prop.name,
          });
        });
      },
    },
  ];

  const hasPropsAcrossAnyProviders = providerPropGroups.some(
    (provider) => (provider.props?.length || 0) > 0,
  );

  if (!hasPropsAcrossAnyProviders) {
    return <LearnToUseCTA />;
  }

  return (
    <>
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
          label="Reset All Provider Props"
          onClick={() => {
            providerPropGroups.forEach((group) => {
              group.reset();
            });
            resetForm();
          }}
          spacing="spacious"
        />
      </div>

      <div className="flex flex-col px-1.5" key={resetKey}>
        {providerPropGroups.map((group) => (
          <Accordion.Root
            defaultExpanded={!!group.props?.length}
            key={group.name}
          >
            <Accordion.Trigger actionId="scenepanel_element_togglepropgroup">
              {group.name}
            </Accordion.Trigger>
            <Accordion.Content forcedExpanded={!!filter}>
              {group.props && !group.props.length && (
                <div className="text-default py-0.5 italic">
                  This component has no props.
                </div>
              )}
              {!group.props && (
                <div className="text-default py-0.5 italic">
                  Export a component named{"  "}
                  {group.exportName} and its props will appear here.
                  <br />
                  <a
                    className="text-link cursor-pointer not-italic underline focus:outline-none"
                    href={createCodeLink(window.triplex.env.config.provider)}
                  >
                    Go to providers.
                  </a>
                </div>
              )}
              {group.message && (
                <div className="text-default py-0.5 italic">
                  {group.message}
                </div>
              )}
              {group.props?.map((prop) => {
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
                        column: group.column,
                        line: group.line,
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
        Props declared on your provider components will appear here to
        configure.
      </span>
      <a
        className="text-link focus-visible:outline-selected focus:outline-[transparent]"
        href="https://triplex.dev/docs/building-your-scene/providers"
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
          href="https://triplex.dev/docs/building-your-scene/providers"
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

preloadSubscription(
  "/scene/:path/:exportName{/:exportName1}{/:exportName2}/props",
  {
    exportName: "GlobalProvider",
    exportName1: "CanvasProvider",
    exportName2: "default",
    path: window.triplex.env.config.provider,
  },
);
