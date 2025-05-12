import { Float } from "@react-three/drei";

export function Sphere({
  color = "hotpink",
  floatIntensity = 0,
  position,
  scale,
  speed = 0,
}: {
  color?: string;
  enabled?: boolean;
  floatIntensity?: number;
  position?: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  return (
    <Float floatIntensity={floatIntensity} speed={speed}>
      <mesh castShadow position={position} scale={scale}>
        <sphereGeometry />
        <meshBasicMaterial color={color} />
      </mesh>
    </Float>
  );
}
