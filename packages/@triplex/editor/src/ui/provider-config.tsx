/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws/react";
import { Suspense, useMemo } from "react";
import { SkeletonContainer, SkeletonText } from "../ds/skeleton";
import { useEnvironment } from "../environment";
import { useProviderStore } from "../stores/provider";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { PropField } from "./prop-field";
import { PropInput, PropTagContext } from "./prop-input";

function Inputs() {
  const providerPath = useEnvironment().config.provider;
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    exportName: "default",
    path: providerPath,
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
      <div className="h-3" />
      {props.length === 0 && (
        <div className="px-4 pb-2.5 text-sm italic text-neutral-400">
          Props declared on your provider component will appear here.{" "}
          <a
            className="text-sm text-blue-400"
            href="#"
            onClick={() =>
              window.triplex.openLink(
                "https://triplex.dev/docs/user-guide/provider-config"
              )
            }
          >
            Learn more
          </a>
          .
        </div>
      )}

      {providerPath &&
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
                      path: providerPath,
                      propName: prop.name,
                      propValue: value,
                    });
                  }}
                  onConfirm={(value) => {
                    setValues(storeKey, prop.name, value);
                  }}
                  path={providerPath}
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
  const isOpen = useProviderStore((store) => store.shown);
  const providerPath = useEnvironment().config.provider;

  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <div className="h-[1px] flex-shrink-0 bg-neutral-800" />

      {providerPath ? (
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
        <div className="px-4 py-2.5 text-sm italic text-neutral-400">
          Set up a provider component to have its props appear here to
          configure.
        </div>
      )}
    </div>
  );
}
