/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useFrame } from "@react-three/fiber";
import { UNSAFE_useXRStore as useXRStore } from "@react-three/xr";
import { useWorld } from "koota/react";
import { type FunctionComponent, type ReactNode } from "react";
import { capitalize } from "../lib/capitalize";
import {
  type ECSSystem,
  type ECSSystemControls,
  type SystemDebugOptions,
} from "./types";

export { createSystem } from "./systems";

export { type ECSSystem, type ECSSystemControls } from "./types";

export function injectSystems<
  TProps extends { children: ReactNode },
  TSystems extends (ECSSystem & SystemDebugOptions)[],
>(Component: FunctionComponent<TProps>, systems: TSystems) {
  function RunSystems(props: ECSSystemControls<TSystems>) {
    const world = useWorld();
    const store = useXRStore();

    useFrame((state, delta) => {
      systems.forEach((system) => {
        const shouldRun = system.systemName
          ? system.dev
            ? props[
                `run${capitalize(system.systemName)}` as keyof ECSSystemControls<TSystems>
              ]
            : !props[
                `pause${capitalize(system.systemName)}` as keyof ECSSystemControls<TSystems>
              ]
          : true;

        if (shouldRun) {
          system(world, delta, state, store);
        }
      });
    });

    return null;
  }

  const ComponentWithSystems = (
    props: TProps & ECSSystemControls<TSystems>,
  ) => {
    return (
      <Component {...props}>
        <RunSystems {...props} />
        {props.children}
      </Component>
    );
  };

  return ComponentWithSystems;
}
