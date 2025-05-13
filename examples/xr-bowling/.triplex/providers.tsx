import { createXRStore, XR } from "@react-three/xr";
import { ReactNode, useState } from "react";

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createXRStore({ emulate: false }));
  return <XR store={store}>{children}</XR>;
}
