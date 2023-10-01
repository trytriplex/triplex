/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/**
 * This work is based on "Breakfast"
 * (https://sketchfab.com/3d-models/breakfast-6fdfdbb8c1b44fadbec33d6eb05c14db)
 * by James Neil (https://sketchfab.com/jamesn) licensed under CC-BY-4.0
 * (http://creativecommons.org/licenses/by/4.0/)
 */
import { Clone, useGLTF } from "@react-three/drei";
import { Vector3Tuple } from "three";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";

export function Frypan({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody
      rotation={rotation}
      position={position}
      colliders={"trimesh"}
      mass={1}
      density={100}
    >
      <Clone castShadow receiveShadow object={nodes.frypan}>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function Bacon({
  variant = "bacon_1",
  position,
  rotation,
}: {
  variant?: "bacon_1" | "bacon_2";
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody rotation={rotation} position={position} colliders={"trimesh"}>
      <Clone castShadow receiveShadow object={nodes[variant]}>
        <meshStandardMaterial map={materials["lambert6SG"].map} />
      </Clone>
    </RigidBody>
  );
}

export function CuttingBoard({ position }: { position?: Vector3Tuple }) {
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <CuboidCollider position={position} args={[1.92, 0.14, 1.32]}>
      <Clone castShadow receiveShadow object={nodes.cutting_board}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody position={position} rotation={rotation} colliders={"cuboid"}>
      <Clone castShadow={true} receiveShadow={true} object={nodes.coffee_cup}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody rotation={rotation} position={position} colliders={"cuboid"}>
      <Clone castShadow receiveShadow object={nodes.egg}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody rotation={rotation} position={position} colliders={"trimesh"}>
      <Clone castShadow receiveShadow object={nodes[variant]}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody rotation={rotation} position={position} colliders={false}>
      <CylinderCollider args={[0.06, 0.5]}>
        <Clone castShadow receiveShadow object={nodes[variant]}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody rotation={rotation} position={position} colliders={"cuboid"}>
      <Clone castShadow receiveShadow object={nodes.plate}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody
      rotation={rotation}
      position={position}
      colliders={"cuboid"}
      mass={0.1}
    >
      <Clone castShadow receiveShadow object={nodes.butter}>
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
  const { nodes, materials } = useGLTF("/assets/breakfast.glb");

  return (
    <RigidBody
      rotation={rotation}
      position={position}
      colliders={"ball"}
      mass={0.1}
    >
      <Clone castShadow receiveShadow object={nodes[variant]}>
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
          position={[0.36011099282757897, 0, 0.1757335858124467]}
        >
          <Sausage
            position={[
              0.5279772897177749, 0.4204646850387307, 0.20743457175327318,
            ]}
            rotation={[
              -3.141592653589793, -0.5507053355872314, -3.141592653589793,
            ]}
          />
          <Sausage
            variant={"sausage_2"}
            rotation={[
              3.141592653589793, -0.6778986344070088, 3.141592653589793,
            ]}
            position={[
              0.25344678087265615, 0.7507853116446526, 0.2654945820241248,
            ]}
          />
          <Egg
            position={[1.030514850082852, 0.76, -0.0944864069847154]}
            rotation={[
              -2.9763791974669767, -0.2784921613522725, 3.0241934151892575,
            ]}
          />
          <Frypan
            position={[
              1.35160562276846, 0.3272218215467831, -0.8301222069262155,
            ]}
          />
          <Bacon
            position={[
              0.6726499434639116, 0.4545375832703098, -0.6817538617658193,
            ]}
            variant={"bacon_1"}
            rotation={[
              3.047325691990559, -0.6102469703269914, 2.8757639096527483,
            ]}
          />
        </group>

        <CuttingBoard
          position={[0.2681269017277474, -0.13094897027373942, 0]}
        />
        <Cup
          position={[
            -1.0600194852633598, 1.068563820693038, -0.7380562035176215,
          ]}
          rotation={[
            0.0035517505280077267, -0.9759177612421335, -0.10925378685024865,
          ]}
        />

        <group
          name="pancakes"
          position={[0.000607940410560559, 0, 0.06351598035668421]}
        >
          <Berry
            position={[
              -1.0143258493350351, 1.8491296422417118, 0.18077933787745476,
            ]}
            variant={"raspberry"}
          />
          <Berry
            position={[
              -0.6439576461969428, 1.8263033501932058, 0.6192870191570334,
            ]}
            variant={"blueberry"}
          />
          <Berry
            position={[
              -0.561303621591706, 1.9804591522540949, 0.7292707609205257,
            ]}
            variant={"blueberry"}
          />
          <Berry
            position={[
              -1.0373627979094773, 1.8014889688568205, 0.4964366525983276,
            ]}
            variant={"raspberry"}
            rotation={[
              3.141592653589793, -1.4517589119805536, 3.141592653589793,
            ]}
          />
          <Berry
            position={[
              -0.506898206793218, 1.907544842752486, 0.5987784905561545,
            ]}
            variant={"blueberry"}
          />
          <Butter
            position={[
              -0.7957860280311837, 1.9327982870323133, 0.401354280745883,
            ]}
          />
          <Pancake
            position={[
              -0.785455934059639, 1.583054226578342, 0.44493200318372905,
            ]}
            variant={"pancake_1"}
          />
          <Pancake
            position={[
              -0.785455934059639, 1.3366303461320017, 0.44493200318372905,
            ]}
            variant={"pancake_2"}
          />
          <Pancake
            position={[
              -0.785455934059639, 1.049983407380215, 0.44493200318372905,
            ]}
            variant={"pancake_3"}
          />
          <Pancake
            position={[
              -0.785455934059639, 0.7976884852017028, 0.44493200318372905,
            ]}
            variant={"pancake_4"}
          />
          <Pancake
            position={[
              -0.785455934059639, 0.4577879062138114, 0.44493200318372905,
            ]}
            variant={"pancake_5"}
          />
          <Plate
            position={[
              -0.8403565747507878, 0.21528573163726866, 0.47439501162598885,
            ]}
          />
        </group>
      </group>
      <pointLight
        position={[-4.101842057534756, 5.508838681006239, -0.5166662661001722]}
        castShadow={true}
        receiveShadow={false}
      />
      <ambientLight intensity={0.5} />
      <pointLight
        position={[-1.2813232667320926, 2.6139046579002114, -5.815240373544561]}
        intensity={0.2}
        castShadow={true}
        color={undefined}
      />
      <pointLight
        position={[4.543368511890467, 3.2958888144297234, 1.9279095030587994]}
        intensity={0.5}
        castShadow={true}
      />
    </>
  );
}
