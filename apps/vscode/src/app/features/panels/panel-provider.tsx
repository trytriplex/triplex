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
import { IconButton } from "../../components/button";
import { useLazySubscription } from "../../hooks/ws";
import { renderPropInputs } from "./inputs";

function ProviderProps() {
  const data = useLazySubscription("/scene/:path/:exportName/props", {
    exportName: "default",
    path: window.triplex.env.config.provider,
  });
  const props = data.props.filter((prop) => prop.name !== "children");
  const [resetKey, resetForm] = useReducer((val) => val + 1, 0);

  return (
    <>
      {props.length === 0 && <LearnToUseCTA />}

      {props.length > 0 && (
        <div className="flex gap-1 p-1.5">
          <input
            className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder h-[26px] w-full rounded-sm border px-[9px] focus:outline-none"
            onChange={() => {}}
            onFocus={(e) => e.stopPropagation()}
            placeholder="Filter props..."
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
          />
        </div>
      )}

      <div className="flex flex-col gap-1 px-1.5" key={resetKey}>
        {props.map((prop) => (
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
        ))}
      </div>
    </>
  );
}

function LearnToUseCTA() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <strong>Provider controls</strong>
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
      <strong>Provider controls</strong>
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
    window.triplex.env.config.provider !== "triplex:empty-provider.tsx";

  return <>{isProviderSetUp ? <ProviderProps /> : <SetUpCTA />}</>;
}
