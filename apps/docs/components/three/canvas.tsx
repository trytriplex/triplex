/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas } from "@react-three/fiber";
import { HeroScene } from "./components/hero-scene";

function Content() {
  return (
    <>
      <HeroScene />
    </>
  );
}

export default function HeroCanvas() {
  return (
    <Canvas
      className="inset-0 -z-10"
      eventSource={document.documentElement}
      shadows
      style={{ pointerEvents: "none", position: "fixed" }}
    >
      <Content />
    </Canvas>
  );
}
