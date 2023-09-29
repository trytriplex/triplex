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
        <div className="px-4 py-1.5 text-sm italic text-neutral-400">
          Props declared on your provider component will appear here.{" "}
          <a
            href="#"
            className="text-blue-400"
            onClick={() => window.triplex.openLink("https://triplex.dev")}
          >
            Learn more
          </a>
          .
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
  if (!isOpen) {
    return null;
  }

  return (
    <Suspense>
      <div className="pointer-events-auto w-64 self-start rounded-lg border border-neutral-800 bg-neutral-900 text-white">
        <h2 className="-mb-2 px-4 pt-4 text-lg font-medium text-neutral-300">
          Provider
        </h2>
        <Inputs />
      </div>
    </Suspense>
  );
}
