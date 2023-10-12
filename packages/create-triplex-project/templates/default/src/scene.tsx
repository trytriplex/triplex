import Box from "./components/box";
import Cylinder from "./components/cylinder";

export default function Scene() {
  return (
    <>
      <Box
        position={[
          1.371_639_009_895_975_9, 0.238_749_717_466_476_33,
          -1.151_498_232_449_661_7,
        ]}
        rotation={[
          1.661_494_056_906_570_6, -0.195_925_017_599_474_28,
          -0.710_446_130_406_401_5,
        ]}
      />

      <Cylinder
        position={[-0.232_795_849_248_139, 0, -0.689_758_047_251_178_2]}
      />

      <ambientLight intensity={0.25} />
      <pointLight
        castShadow
        intensity={0.5}
        position={[
          -0.482_619_854_385_572_1, 1.637_717_898_929_267_1,
          5.340_964_327_093_364,
        ]}
      />
      <pointLight
        castShadow
        intensity={0.5}
        position={[6.417_857_009_063_590_5, 1, -0.971_179_366_470_470_7]}
      />
      <pointLight castShadow intensity={0.5} />

      <group>
        <mesh
          castShadow
          position={[
            -1.700_095_441_825_617_6, -0.399_461_895_406_439_3,
            -0.505_561_992_095_095_1,
          ]}
          receiveShadow
          rotation={[
            -0.157_541_561_762_468_4, 0.476_041_450_074_098_26,
            0.333_688_571_732_678_85,
          ]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#fdfd96" />
        </mesh>
      </group>

      <mesh
        position={[
          -0.197_252_395_797_251_3, -0.973_632_597_685_8,
          -0.730_679_006_420_781_7,
        ]}
        receiveShadow
        rotation={[-1.555_675_357_861_391_6, 0, 0]}
      >
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#eae0da" />
      </mesh>
    </>
  );
}
