import { Sky } from "@react-three/drei";
import {
  FixedBvhPhysicsBody,
  PrototypeBox,
  SimpleCharacter,
  Viverse,
} from "@react-three/viverse";

export function DebugLevel() {
  return (
    <Viverse>
      <Sky />
      <directionalLight castShadow intensity={1.2} position={[-10, 10, -10]} />
      <ambientLight intensity={1} />
      <SimpleCharacter />
      <FixedBvhPhysicsBody>
        <PrototypeBox position={[0, -0.5, 0]} scale={[10, 1, 15]} />
      </FixedBvhPhysicsBody>
    </Viverse>
  );
}
