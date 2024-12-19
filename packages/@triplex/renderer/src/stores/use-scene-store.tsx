/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { send } from "@triplex/bridge/client";
import { create } from "zustand";

interface SceneStore {
  component: {
    exportName: string;
    path: string;
    props: Record<string, unknown>;
  };
  switchToComponent: (component: SceneStore["component"]) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  component: { exportName: "", path: "", props: {} },
  switchToComponent(component) {
    set({ component });
    send("component-opened", {
      encodedProps: JSON.stringify(component.props),
      entered: true,
      exportName: component.exportName,
      path: component.path,
    });
  },
}));
