/**
 * This work is based on "Breakfast"
 * (https://sketchfab.com/3d-models/breakfast-6fdfdbb8c1b44fadbec33d6eb05c14db)
 * by James Neil (https://sketchfab.com/jamesn) licensed under CC-BY-4.0
 * (http://creativecommons.org/licenses/by/4.0/)
 */
import { Clone, useGLTF } from "@react-three/drei";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { type Vector3Tuple } from "three";

export function Frypan({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody
      colliders={"trimesh"}
      density={100}
      mass={1}
      position={position}
      rotation={rotation}
    >
      <Clone castShadow object={nodes.frypan} receiveShadow>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Bacon({
  position,
  rotation,
  variant = "bacon_1",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "bacon_1" | "bacon_2";
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody colliders={"trimesh"} position={position} rotation={rotation}>
      <Clone castShadow object={nodes[variant]} receiveShadow>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function CuttingBoard({ position }: { position?: Vector3Tuple }) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <CuboidCollider args={[1.92, 0.14, 1.32]} position={position}>
      <Clone castShadow object={nodes.cutting_board} receiveShadow>
        <meshStandardMaterial map={materials["lambert7SG"].map} />
      </Clone>
    </CuboidCollider>
  );
}

export function Cup({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody colliders={"cuboid"} position={position} rotation={rotation}>
      <Clone castShadow={true} object={nodes.coffee_cup} receiveShadow={true}>
        <meshStandardMaterial map={materials["lambert7SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Egg({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody colliders={"cuboid"} position={position} rotation={rotation}>
      <Clone castShadow object={nodes.egg} receiveShadow>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Sausage({
  position,
  rotation,
  variant = "sausage_1",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "sausage_1" | "sausage_2";
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody colliders={"trimesh"} position={position} rotation={rotation}>
      <Clone castShadow object={nodes[variant]} receiveShadow>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Pancake({
  position,
  rotation,
  variant = "pancake_1",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "pancake_1" | "pancake_2" | "pancake_3" | "pancake_4" | "pancake_5";
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody colliders={false} position={position} rotation={rotation}>
      <CylinderCollider args={[0.06, 0.5]}>
        <Clone castShadow object={nodes[variant]} receiveShadow>
          <meshStandardMaterial map={materials["lambert7SG"].map} />
        </Clone>
      </CylinderCollider>
    </RigidBody>
  );
}

export function Plate({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody colliders={"cuboid"} position={position} rotation={rotation}>
      <Clone castShadow object={nodes.plate} receiveShadow>
        <meshStandardMaterial map={materials["lambert7SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Butter({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody
      colliders={"cuboid"}
      mass={0.1}
      position={position}
      rotation={rotation}
    >
      <Clone castShadow object={nodes.butter} receiveShadow>
        <meshStandardMaterial map={materials["lambert7SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Berry({
  position,
  rotation,
  variant = "raspberry",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  variant?: "raspberry" | "blueberry";
}) {
  const { materials, nodes } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody
      colliders={"ball"}
      mass={0.1}
      position={position}
      rotation={rotation}
    >
      <Clone castShadow object={nodes[variant]} receiveShadow>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Breakfast() {
  return (
    <>
      <group name="scene">
        <group
          name="frypan"
          position={[0.360_110_992_827_578_97, 0, 0.175_733_585_812_446_7]}
        >
          <Sausage
            position={[
              0.527_977_289_717_774_9, 0.420_464_685_038_730_7,
              0.207_434_571_753_273_18,
            ]}
            rotation={[
              -3.141_592_653_589_793, -0.550_705_335_587_231_4,
              -3.141_592_653_589_793,
            ]}
          />
          <Sausage
            position={[
              0.253_446_780_872_656_15, 0.750_785_311_644_652_6,
              0.265_494_582_024_124_8,
            ]}
            rotation={[
              3.141_592_653_589_793, -0.677_898_634_407_008_8,
              3.141_592_653_589_793,
            ]}
            variant={"sausage_2"}
          />
          <Egg
            position={[1.030_514_850_082_852, 0.76, -0.094_486_406_984_715_4]}
            rotation={[
              -2.976_379_197_466_976_7, -0.278_492_161_352_272_5,
              3.024_193_415_189_257_5,
            ]}
          />
          <Frypan
            position={[
              1.351_605_622_768_46, 0.327_221_821_546_783_1,
              -0.830_122_206_926_215_5,
            ]}
          />
          <Bacon
            position={[
              0.672_649_943_463_911_6, 0.454_537_583_270_309_8,
              -0.681_753_861_765_819_3,
            ]}
            rotation={[
              3.047_325_691_990_559, -0.610_246_970_326_991_4,
              2.875_763_909_652_748_3,
            ]}
            variant={"bacon_1"}
          />
        </group>

        <CuttingBoard
          position={[0.268_126_901_727_747_4, -0.130_948_970_273_739_42, 0]}
        />
        <Cup
          position={[
            -1.060_019_485_263_359_8, 1.068_563_820_693_038,
            -0.738_056_203_517_621_5,
          ]}
          rotation={[
            0.003_551_750_528_007_726_7, -0.975_917_761_242_133_5,
            -0.109_253_786_850_248_65,
          ]}
        />

        <group
          name="pancakes"
          position={[0.000_607_940_410_560_559, 0, 0.063_515_980_356_684_21]}
        >
          <Berry
            position={[
              -1.014_325_849_335_035_1, 1.849_129_642_241_711_8,
              0.180_779_337_877_454_76,
            ]}
            variant={"raspberry"}
          />
          <Berry
            position={[
              -0.643_957_646_196_942_8, 1.826_303_350_193_205_8,
              0.619_287_019_157_033_4,
            ]}
            variant={"blueberry"}
          />
          <Berry
            position={[
              -0.561_303_621_591_706, 1.980_459_152_254_094_9,
              0.729_270_760_920_525_7,
            ]}
            variant={"blueberry"}
          />
          <Berry
            position={[
              -1.037_362_797_909_477_3, 1.801_488_968_856_820_5,
              0.496_436_652_598_327_6,
            ]}
            rotation={[
              3.141_592_653_589_793, -1.451_758_911_980_553_6,
              3.141_592_653_589_793,
            ]}
            variant={"raspberry"}
          />
          <Berry
            position={[
              -0.506_898_206_793_218, 1.907_544_842_752_486,
              0.598_778_490_556_154_5,
            ]}
            variant={"blueberry"}
          />
          <Butter
            position={[
              -0.795_786_028_031_183_7, 1.932_798_287_032_313_3,
              0.401_354_280_745_883,
            ]}
          />
          <Pancake
            position={[
              -0.785_455_934_059_639, 1.583_054_226_578_342,
              0.444_932_003_183_729_05,
            ]}
            variant={"pancake_1"}
          />
          <Pancake
            position={[
              -0.785_455_934_059_639, 1.336_630_346_132_001_7,
              0.444_932_003_183_729_05,
            ]}
            variant={"pancake_2"}
          />
          <Pancake
            position={[
              -0.785_455_934_059_639, 1.049_983_407_380_215,
              0.444_932_003_183_729_05,
            ]}
            variant={"pancake_3"}
          />
          <Pancake
            position={[
              -0.785_455_934_059_639, 0.797_688_485_201_702_8,
              0.444_932_003_183_729_05,
            ]}
            variant={"pancake_4"}
          />
          <Pancake
            position={[
              -0.785_455_934_059_639, 0.457_787_906_213_811_4,
              0.444_932_003_183_729_05,
            ]}
            variant={"pancake_5"}
          />
          <Plate
            position={[
              -0.840_356_574_750_787_8, 0.215_285_731_637_268_66,
              0.474_395_011_625_988_85,
            ]}
          />
        </group>
      </group>
      <pointLight
        castShadow={true}
        intensity={50}
        position={[
          -4.101_842_057_534_756, 5.508_838_681_006_239,
          -0.516_666_266_100_172_2,
        ]}
        receiveShadow={false}
      />
      <ambientLight intensity={0.5} />
      <pointLight
        castShadow={true}
        color={undefined}
        intensity={20}
        position={[
          -1.281_323_266_732_092_6, 2.613_904_657_900_211_4,
          -5.815_240_373_544_561,
        ]}
      />
      <pointLight
        castShadow={true}
        intensity={30}
        position={[
          4.543_368_511_890_467, 3.295_888_814_429_723_4,
          1.927_909_503_058_799_4,
        ]}
      />
    </>
  );
}
