/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas } from "@react-three/fiber";

export function Button({
  text,
  type = "button",
  variant = 'default',
}: {
  text: string;
  type?: "submit" | "button";
  variant?: "default" | "primary";
}) {
  return (
    <button
      style={{
        background: variant === "primary" ? "blue" : "gray",
        color: variant === "primary" ? "white" : "black",
      }}
      type={type}
    >
      {text}
    </button>
  );
}

export function CanvasExample() {
  return (
    <>
      <Canvas>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
      <div
        style={{
          color: "yellow",
          fontFamily: "sans-serif",
          fontSize: 36,
          fontWeight: 500,
          left: 8,
          position: "fixed",
          top: 36,
        }}
      >
        HTML CONTENT OUTSIDE CANVAS
      </div>
    </>
  );
}
