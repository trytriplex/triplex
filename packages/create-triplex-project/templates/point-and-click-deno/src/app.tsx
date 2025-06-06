import { Canvas } from "@react-three/fiber";
import { DebugLevel } from "./levels/debug.tsx";
import { KootaSystems } from "./providers.tsx";

export function App() {
  return (
    <Canvas shadows>
      <KootaSystems>
        <DebugLevel />
      </KootaSystems>
    </Canvas>
  );
}
