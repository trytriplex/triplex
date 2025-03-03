/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useScreenView } from "@triplex/ux";
import { Suspense, useMemo } from "react";
import { ExternalLink } from "../ds/external-link";
import { SkeletonContainer, SkeletonText } from "../ds/skeleton";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { IDELink } from "../util/ide";
import { preloadSubscription, useSubscription } from "../util/ws";
import { PropField } from "./prop-field";
import { PropInput, PropTagContext } from "./prop-input";

function Inputs() {
  // TODO: Global provider props aren't available in Triplex Standalone currently.
  const [canvasProvider, deprecatedCanvasProvider] = useSubscription(
    "/scene/:path/:exportName{/:exportName1}{/:exportName2}/props",
    {
      exportName: "CanvasProvider",
      exportName1: "default",
      path: window.triplex.env.config.provider,
    },
  );
  const { setPropValue } = useScene();
  const storeKey = "__provider__";
  const setValues = useSceneState((state) => state.set);
  const values = useSceneState((state) => state.get(storeKey));
  const data = canvasProvider || deprecatedCanvasProvider || { props: [] };
  const props = data.props.filter((prop) => prop.name !== "children");
  const defaultValues: Record<string, unknown> = useMemo(
    () =>
      data.props.reduce((acc, prop) => {
        const value =
          prop.defaultValue && prop.defaultValue.kind !== "unhandled"
            ? prop.defaultValue.value
            : undefined;

        if (value !== undefined) {
          return Object.assign(acc, { [prop.name]: value });
        }

        return acc;
      }, {}),
    [data.props],
  );

  return (
    <>
      {props.length === 0 ? (
        <div className="flex flex-col gap-2 px-4 py-3">
          <span className="text-xs text-neutral-400">
            Props declared on your provider component will appear here.
          </span>
          <ExternalLink
            actionId="contextpanel_docs_providercontrols_noprops"
            size="xs"
            to="https://triplex.dev/docs/guides/provider-controls"
          >
            Learn how to use this feature.
          </ExternalLink>
          .
        </div>
      ) : (
        <div className="h-3 flex-shrink-0" />
      )}

      {window.triplex.env.config.provider &&
        props.map((prop) => {
          const value =
            prop.name in values ? values[prop.name] : defaultValues[prop.name];

          return (
            <PropField
              description={prop.description}
              htmlFor={prop.name}
              key={prop.name}
              label={prop.name}
              tags={prop.tags}
            >
              <PropTagContext.Provider value={prop.tags}>
                <PropInput
                  name={prop.name}
                  onChange={(value) => {
                    setPropValue({
                      column: -999,
                      line: -999,
                      path: window.triplex.env.config.provider,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  onConfirm={(value) => {
                    setValues(storeKey, prop.name, value);
                  }}
                  path={window.triplex.env.config.provider}
                  prop={Object.assign({}, prop, value ? { value } : {})}
                  required={prop.required}
                />
              </PropTagContext.Provider>
            </PropField>
          );
        })}
      <div className="h-1" />
    </>
  );
}

export function ProviderConfig() {
  useScreenView("provider_controls", "Panel");

  return (
    <>
      <h2
        className="px-4 pt-3 text-sm font-medium text-neutral-300"
        data-testid="context-panel-heading"
      >
        Provider Controls
      </h2>

      <div className="-mt-0.5 mb-2.5 px-4">
        {window.triplex.env.config.provider && (
          <>
            <IDELink
              actionId="contextpanel_provider_viewsource"
              column={0}
              line={0}
              path={window.triplex.env.config.provider}
            >
              View source
            </IDELink>

            <span className="mx-1.5 text-xs text-neutral-400">•</span>
          </>
        )}
        <ExternalLink
          actionId="contextpanel_docs_providercontrols_learnmore"
          size="xs"
          to="https://triplex.dev/docs/guides/provider-controls"
          variant="subtle"
        >
          Learn more
        </ExternalLink>
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {window.triplex.env.config.provider.includes("/") ? (
        <Suspense
          fallback={
            <div className="px-4 py-4">
              <SkeletonContainer>
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
                <SkeletonText variant="ui" />
              </SkeletonContainer>
            </div>
          }
        >
          <Inputs />
        </Suspense>
      ) : (
        <div className="flex flex-col gap-2 px-4 py-3">
          <span className="text-xs text-neutral-400">
            Set up a provider component and its props will appear here to
            configure.
          </span>
          <ExternalLink
            actionId="contextpanel_docs_providercontrols_setup"
            size="xs"
            to="https://triplex.dev/docs/guides/provider-controls"
          >
            Learn how to set one up.
          </ExternalLink>
        </div>
      )}
    </>
  );
}

preloadSubscription(
  "/scene/:path/:exportName{/:exportName1}{/:exportName2}/props",
  {
    exportName: "CanvasProvider",
    exportName1: "default",
    path: window.triplex.env.config.provider,
  },
);
