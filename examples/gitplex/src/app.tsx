/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Canvas } from "@react-three/fiber";
import { Avatar } from "./avatar";

export function App() {
  return (
    <div className="p-10">
      <Canvas>
        <Avatar />
      </Canvas>
      <div className="text-lg font-medium">GitPlex Copilot</div>
    </div>
  );
}
