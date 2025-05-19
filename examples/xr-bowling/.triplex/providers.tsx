import { createXRStore, XR } from "@react-three/xr";
import { useState, type ReactNode } from "react";
import { HandController } from "../src/hand-controller";

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() =>
    createXRStore({ controller: HandController, emulate: false, hand: false }),
  );

  return <XR store={store}>{children}</XR>;
}
