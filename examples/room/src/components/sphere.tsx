import { Float } from "@react-three/drei";

export function Sphere({
  color = "hotpink",
  floatIntensity = 0,
  position,
  scale,
  speed = 0,
}: {
  color?: string;
  floatIntensity?: number;
  position?: [number, number, number];
  scale?: number;
  enabled?: boolean;
  speed?: number;
}) {
  return (
    <Float speed={speed} floatIntensity={floatIntensity}>
      <mesh castShadow position={position} scale={scale}>
        <sphereGeometry />
        <meshBasicMaterial color={color} />
      </mesh>
    </Float>
  );
}
