/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas } from "@react-three/fiber";

export function Button({
  children,
  color = "red",
}: {
  children: string;
  color?: "red" | "blue";
}) {
  return (
    <button style={{ color, height: "100vh", width: "100vh" }} type="submit">
      {children}
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
