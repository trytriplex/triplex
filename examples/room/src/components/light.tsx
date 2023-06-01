export function Light() {
  return (
    <group>
      <directionalLight
        position={[5, 5, -8]}
        castShadow
        intensity={5}
        shadow-mapSize={2048}
        shadow-bias={-0.001}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]}
        />
      </directionalLight>
    </group>
  );
}
