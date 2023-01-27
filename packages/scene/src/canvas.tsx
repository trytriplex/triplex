import { Canvas as RCanvas } from "@react-three/fiber";
import React from "react";

export function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <RCanvas
      gl={{ antialias: false }}
      id="editor-canvas"
      shadows
      style={{ position: "absolute", inset: 0, backgroundColor: "black" }}
    >
      {children}
    </RCanvas>
  );
}
