import Box from "./components/box";
import Cylinder from "./components/cylinder";

export default function Scene() {
  return (
    <>
      <Box
        position={[
          1.3716390098959759, 0.23874971746647633, -1.1514982324496617,
        ]}
        rotation={[
          1.6614940569065706, -0.19592501759947428, -0.7104461304064015,
        ]}
      />

      <Cylinder position={[-0.232795849248139, 0, -0.6897580472511782]} />

      <ambientLight intensity={0.25} />
      <pointLight
        castShadow
        intensity={0.5}
        position={[-0.4826198543855721, 1.6377178989292671, 5.340964327093364]}
      />
      <pointLight
        castShadow
        position={[6.4178570090635905, 1, -0.9711793664704707]}
        intensity={0.5}
      />
      <pointLight castShadow intensity={0.5} />

      <group>
        <mesh
          castShadow
          receiveShadow
          rotation={[
            -0.1575415617624684, 0.47604145007409826, 0.33368857173267885,
          ]}
          position={[
            -1.7000954418256176, -0.3994618954064393, -0.5055619920950951,
          ]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#fdfd96" />
        </mesh>
      </group>

      <mesh
        receiveShadow
        rotation={[-1.5556753578613916, 0, 0]}
        position={[-0.1972523957972513, -0.9736325976858, -0.7306790064207817]}
      >
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#eae0da" />
      </mesh>
    </>
  );
}
