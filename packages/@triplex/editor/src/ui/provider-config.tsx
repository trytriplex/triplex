/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws/react";
import { Suspense, useMemo } from "react";
import { useScreenView } from "../analytics";
import { SkeletonContainer, SkeletonText } from "../ds/skeleton";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { IDELink } from "../util/ide";
import { PropField } from "./prop-field";
import { PropInput, PropTagContext } from "./prop-input";

function Inputs() {
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    exportName: "default",
    path: window.triplex.env.config.provider,
  });
  const { setPropValue } = useScene();
  const storeKey = "__provider__";
  const setValues = useSceneState((state) => state.set);
  const values = useSceneState((state) => state.get(storeKey));
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
    [data.props]
  );

  return (
    <>
      {props.length === 0 ? (
        <div className="flex flex-col gap-2 px-4 py-3">
          <span className="text-xs text-neutral-400">
            Props declared on your provider component will appear here.
          </span>
          <a
            className="text-xs text-blue-400"
            href="#"
            onClick={() =>
              window.triplex.openLink(
                "https://triplex.dev/docs/user-guide/provider-config"
              )
            }
          >
            Learn more about this feature.
          </a>
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
  useScreenView("context_provider", "Panel");

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
              column={0}
              line={0}
              path={window.triplex.env.config.provider}
            >
              View source
            </IDELink>

            <span className="mx-1.5 text-xs text-neutral-400">•</span>
          </>
        )}
        <a
          className="text-xs text-neutral-400"
          href="#"
          onClick={() =>
            window.triplex.openLink(
              "https://triplex.dev/docs/user-guide/provider-config"
            )
          }
        >
          Learn more
        </a>
      </div>

      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {window.triplex.env.config.provider ? (
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
          <a
            className="text-xs text-blue-400"
            href="#"
            onClick={() =>
              window.triplex.openLink(
                "https://triplex.dev/docs/user-guide/provider-config"
              )
            }
          >
            Learn how to set one up.
          </a>
        </div>
      )}
    </>
  );
}
