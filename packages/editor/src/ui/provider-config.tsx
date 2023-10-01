/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws-client";
import { Suspense } from "react";
import { ScrollContainer } from "../ds/scroll-container";
import { useProviderStore } from "../stores/provider";
import { useScene } from "../stores/scene";
import { useSceneState } from "../stores/scene-state";
import { PropField } from "./prop-field";
import { PropInput, PropTagContext } from "./prop-input";
import { useEnvironment } from "../environment";
import { IDELink } from "../util/ide";

function Inputs() {
  const providerPath = useEnvironment().config.provider;
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    path: providerPath,
    exportName: "default",
  });
  const { setPropValue } = useScene();
  const storeKey = "__provider__";
  const setValues = useSceneState((state) => state.set);
  const values = useSceneState((state) => state.get(storeKey));
  const props = data.props.filter((prop) => prop.name !== "children");

  return (
    <ScrollContainer>
      <div className="h-3" />
      {props.length === 0 && (
        <div className="px-4 pb-2.5 text-sm italic text-neutral-400">
          Props declared on your provider component will appear here.
        </div>
      )}

      {props.map((prop) => {
        return (
          <PropField
            htmlFor={prop.name}
            label={prop.name}
            description={prop.description}
            tags={prop.tags}
            key={prop.name}
          >
            <PropTagContext.Provider value={prop.tags}>
              <PropInput
                name={prop.name}
                path={providerPath}
                prop={Object.assign(
                  {},
                  prop,
                  values[prop.name] ? { value: values[prop.name] } : {}
                )}
                required={prop.required}
                onConfirm={(value) => {
                  setValues(storeKey, prop.name, value);
                }}
                onChange={(value) => {
                  setPropValue({
                    column: -999,
                    line: -999,
                    path: providerPath,
                    propName: prop.name,
                    propValue: value,
                  });
                }}
              />
            </PropTagContext.Provider>
          </PropField>
        );
      })}
      <div className="h-1" />
    </ScrollContainer>
  );
}

export function ProviderConfig() {
  const isOpen = useProviderStore((store) => store.shown);
  const providerPath = useEnvironment().config.provider;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-64 self-start overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 text-white">
      <h2 className="text-md px-4 pt-3 font-medium text-neutral-300">
        Provider Config
      </h2>
      <div className="-mt-0.5 mb-2 px-4">
        {providerPath && (
          <>
            <IDELink path={providerPath} column={1} line={1}>
              View source
            </IDELink>
            <span className="mx-1.5 text-xs text-neutral-400">•</span>
          </>
        )}

        <a
          href="#"
          className="text-xs text-neutral-400"
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

      {providerPath ? (
        <Suspense
          fallback={
            <div className="px-4 py-2.5 text-sm italic text-neutral-400">
              Loading...
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
